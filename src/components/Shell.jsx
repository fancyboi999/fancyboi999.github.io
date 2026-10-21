// 整页卡片转场：每个页面是一张铺满屏幕的卡片，页面在卡片内部滚动。
// 换页时旧卡片缩小，露出背后的像素天空，新卡片从下方升起，再放大铺满。
// 时长与曲线见仓库根目录 MOTION.md 的"页面转场"。
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { PixelSky } from "./fx.jsx";
import { loadBody } from "../content.js";
import { pageMeta } from "../meta.js";

const IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const RISE = "cubic-bezier(0.23, 1, 0.32, 1)";
const T = { depth: 0.8, shrinkMs: 380, riseAt: 300, riseMs: 460, growMs: 420 };

const frame = () => new Promise((r) => requestAnimationFrame(r));

// 新页需要的数据先准备好，避免卡片升起时还是空的
function prepare(pathname) {
  const post = pathname.match(/^\/posts\/([^/]+)\/?$/);
  return post ? loadBody(decodeURIComponent(post[1])) : Promise.resolve();
}

// 旧卡片缩小的同时挂载新卡片；新卡片在转场开始 300ms 后升起，等旧卡片缩完再放大
async function swap(oldCard, mountNew) {
  const shrink = oldCard.animate([{ transform: "scale(1)" }, { transform: `scale(${T.depth})` }], { duration: T.shrinkMs, easing: IN_OUT, fill: "forwards" });
  const t0 = performance.now();
  const card = await mountNew();
  await card.animate(
    [{ transform: `translateY(100%) scale(${T.depth})`, opacity: 1 }, { transform: `translateY(0) scale(${T.depth})`, opacity: 1 }],
    { duration: T.riseMs, delay: Math.max(0, T.riseAt - (performance.now() - t0)), easing: RISE, fill: "both" },
  ).finished;
  await shrink.finished;
  await card.animate([{ transform: `scale(${T.depth})`, opacity: 1 }, { transform: "scale(1)", opacity: 1 }], { duration: T.growMs, easing: IN_OUT, fill: "forwards" }).finished;
  return card;
}

// 页面里的普通 <a>（文章正文、页脚）也走转场；带扩展名的静态文件（feed.xml 等）照常整页打开
function useInterceptLinks(navigate) {
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || /\.[a-z0-9]+$/i.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // 同页锚点交给浏览器
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);
}

function Card({ location, arriving, cardRef, Page }) {
  return (
    <div className={`site-card${arriving ? " is-arriving" : ""}`} ref={cardRef}>
      <div className="stage" data-stage tabIndex={-1}>
        <Page location={location} />
      </div>
    </div>
  );
}

export default function Shell({ Page }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cards, setCards] = useState(() => [{ key: 0, location }]);
  const [arriving, setArriving] = useState(null);
  const [moving, setMoving] = useState(false);
  const els = useRef(new Map());
  const current = useRef(cards[0]);
  const busy = useRef(false);
  const latest = useRef(location);
  useInterceptLinks(navigate);

  // 先于下面的转场 effect 执行，转场读到的总是最新地址
  useEffect(() => { latest.current = location; });

  useEffect(() => {
    const go = async () => {
      const next = latest.current;
      if (busy.current || next.pathname === current.current.location.pathname) return;
      busy.current = true;
      const { title, description } = pageMeta(next.pathname);
      document.title = title;
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);

      const oldCard = els.current.get(current.current.key);
      oldCard.inert = true;
      const card = { key: current.current.key + 1, location: next };
      await prepare(next.pathname);
      const mountNew = async () => {
        flushSync(() => { setCards((c) => [...c, card]); setArriving(card.key); });
        await frame();
        await frame();
        return els.current.get(card.key);
      };

      let el;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el = await mountNew();
        await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out", fill: "forwards" }).finished;
      } else {
        flushSync(() => setMoving(true));
        el = await swap(oldCard, mountNew);
      }

      current.current = card;
      flushSync(() => { setCards([card]); setArriving(null); setMoving(false); });
      for (const a of el.getAnimations()) a.cancel();
      const stage = el.querySelector("[data-stage]");
      stage.focus({ preventScroll: true });
      if (next.hash) stage.querySelector(`[id="${CSS.escape(decodeURIComponent(next.hash.slice(1)))}"]`)?.scrollIntoView();
      busy.current = false;
      go(); // 转场期间地址又变了，就接着再转一次
    };
    go();
  }, [location.pathname]);

  return (
    <div className="site" data-moving={moving || undefined}>
      {moving ? <PixelSky className="site-sky" options={{ cell: 22, seed: 12, drift: 40, reveal: "none" }} /> : null}
      {cards.map((c) => (
        <Card
          key={c.key}
          location={c.location}
          arriving={c.key === arriving}
          Page={Page}
          cardRef={(el) => { if (el) els.current.set(c.key, el); else els.current.delete(c.key); }}
        />
      ))}
    </div>
  );
}
