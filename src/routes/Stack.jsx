// 工具箱：两种看法。
//   画布：仿 andreas.vision/play，一整屏可拖拽的无限卡片墙（拖拽、滚轮/触控板、方向键都能平移）
//   分类：仿 designeer.xyz，按类别筛选的卡片网格
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { stackCategories, stackItems } from "../stack.js";
import { PixelSprite } from "../components/fx.jsx";
import { Arrow, Footer } from "../components/Layout.jsx";

const N = stackItems.length;
const TILE_W = 320;
const PITCH_X = 384; // 列距
const PITCH_Y = 344; // 行距
const mod = (a, n) => ((a % n) + n) % n;
// 相邻格子（左右差 5、上下差 3、对角差 2 或 8）对 23 取模都不为 0，所以邻居永远不重复
const itemAt = (c, r) => stackItems[mod(c * 5 + r * 3, N)];
const colShift = (c) => (mod(c, 2) ? PITCH_Y / 2 : 0); // 奇数列下沉半格，错落感

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function rangeFor(o, size) {
  return {
    c0: Math.floor(-o.x / PITCH_X) - 1,
    c1: Math.ceil((-o.x + size.w) / PITCH_X),
    r0: Math.floor((-o.y - PITCH_Y) / PITCH_Y) - 1,
    r1: Math.ceil((-o.y + size.h) / PITCH_Y),
  };
}
const sameRange = (a, b) => a.c0 === b.c0 && a.c1 === b.c1 && a.r0 === b.r0 && a.r1 === b.r1;

function Tile({ item, c, r, origin, focusable }) {
  const x = c * PITCH_X, y = r * PITCH_Y + colShift(c);
  // 入场错峰：离初始画面中心越远越晚
  const d = Math.round(Math.hypot(x - origin.x, y - origin.y) / 120);
  return (
    <a
      className="wall-tile lift"
      href={item.url}
      target="_blank"
      rel="noopener"
      style={{ transform: `translate(${x}px, ${y}px)`, "--d": d }}
      tabIndex={focusable ? undefined : -1}
      onDragStart={(e) => e.preventDefault()}
      data-cell={`${c},${r}`}
    >
      <span className="lift-card wall-media">
        <img src={item.image} alt="" loading="lazy" decoding="async" width="800" height="516" draggable="false" />
      </span>
      <span className="wall-caption">
        <span className="wall-name">{item.name}</span>
        <span className="wall-note">{item.note}</span>
      </span>
    </a>
  );
}

function Wall() {
  const wall = useRef(null);
  const world = useRef(null);
  const size = useRef({ w: 1440, h: 900 });
  const offset = useRef({ x: 0, y: 0 });
  const [range, setRange] = useState(() => rangeFor({ x: 0, y: 0 }, size.current));
  const [entering, setEntering] = useState(true);
  const origin = useRef({ x: 0, y: 0 });

  const apply = () => {
    const o = offset.current;
    world.current.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
    const next = rangeFor(o, size.current);
    setRange((prev) => (sameRange(prev, next) ? prev : next));
  };

  // 初始画面：让第 0 列第 0 行落在视口中央偏左上
  useIso(() => {
    const el = wall.current;
    size.current = { w: el.clientWidth, h: el.clientHeight };
    offset.current = { x: Math.round(size.current.w / 2 - TILE_W / 2 - PITCH_X), y: Math.round(size.current.h / 2 - PITCH_Y) };
    origin.current = { x: -offset.current.x + size.current.w / 2, y: -offset.current.y + size.current.h / 2 };
    apply();
    const t = setTimeout(() => setEntering(false), 1400);
    const ro = new ResizeObserver(() => { size.current = { w: el.clientWidth, h: el.clientHeight }; apply(); });
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  // 拖拽 + 惯性；位移超过 6px 视为拖拽，拦掉松手时的点击
  useEffect(() => {
    const el = wall.current;
    let drag = null, raf = 0, moved = 0;
    const stop = () => cancelAnimationFrame(raf);
    const glide = (vx, vy) => {
      if (reduced()) return;
      const step = () => {
        vx *= 0.92; vy *= 0.92;
        if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
        offset.current.x += vx; offset.current.y += vy; apply();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const down = (e) => {
      if (e.button !== 0) return;
      stop();
      moved = 0;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6 && !el.hasPointerCapture(e.pointerId)) { el.setPointerCapture(e.pointerId); el.classList.add("is-dragging"); }
      const now = performance.now(), dt = Math.max(1, now - drag.t);
      drag.vx = (dx / dt) * 16; drag.vy = (dy / dt) * 16;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
      offset.current.x += dx; offset.current.y += dy; apply();
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      el.classList.remove("is-dragging");
      if (performance.now() - drag.t < 80) glide(drag.vx, drag.vy);
      drag = null;
    };
    const click = (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    const wheel = (e) => { e.preventDefault(); stop(); offset.current.x -= e.deltaX; offset.current.y -= e.deltaY; apply(); };
    const key = (e) => {
      const k = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!k || e.target !== el) return;
      e.preventDefault();
      offset.current.x += k[0] * 120; offset.current.y += k[1] * 120; apply();
    };
    // Tab 到视口外的卡片时，把它平移进来
    const focus = (e) => {
      const tile = e.target.closest?.(".wall-tile");
      if (!tile) return;
      const a = el.getBoundingClientRect(), b = tile.getBoundingClientRect(), pad = 96;
      let dx = 0, dy = 0;
      if (b.left < a.left + pad) dx = a.left + pad - b.left; else if (b.right > a.right - pad) dx = a.right - pad - b.right;
      if (b.top < a.top + pad) dy = a.top + pad - b.top; else if (b.bottom > a.bottom - pad) dy = a.bottom - pad - b.bottom;
      if (dx || dy) { offset.current.x += dx; offset.current.y += dy; apply(); }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("keydown", key);
    el.addEventListener("focusin", focus);
    return () => {
      stop();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("keydown", key);
      el.removeEventListener("focusin", focus);
    };
  }, []);

  // 按行生成：Tab 顺序先左右、再换行。只有视口内的卡片可被 Tab 选中（视口外的是平移缓冲），
  // 看更多用方向键平移；完整清单在"分类"视图里
  const o = offset.current, v = size.current;
  const inView = (c, r) => {
    const x = c * PITCH_X + o.x, y = r * PITCH_Y + colShift(c) + o.y;
    return x + TILE_W > 0 && x < v.w && y + PITCH_Y > 0 && y < v.h;
  };
  const cells = [];
  for (let r = range.r0; r <= range.r1; r++) {
    for (let c = range.c0; c <= range.c1; c++) cells.push(<Tile key={`${c},${r}`} item={itemAt(c, r)} c={c} r={r} origin={origin.current} focusable={inView(c, r)} />);
  }
  return (
    <div
      className={`wall${entering ? " is-entering" : ""}`}
      ref={wall}
      tabIndex={0}
      role="region"
      aria-label="工具墙：拖动、滚动或用方向键平移，点卡片打开官网；完整清单见“分类”视图"
      data-lenis-prevent
    >
      <div className="wall-world" ref={world}>{cells}</div>
    </div>
  );
}

function Shelf() {
  const [cat, setCat] = useState("all");
  const shown = cat === "all" ? stackCategories : stackCategories.filter((c) => c.id === cat);
  return (
    <div className="page shelf">
      <header className="page-head">
        <p className="kicker">{N} 个工具 · {stackCategories.length} 类</p>
        <h1 className="page-title">Stack</h1>
        <p className="shelf-lead">做 Web 界面时反复用到的库和工具，按用途分好类，每一项都直达官网。</p>
      </header>
      <div className="cloud shelf-filter" role="group" aria-label="按类别筛选">
        <button type="button" className="chip chip-lg" aria-pressed={cat === "all"} onClick={() => setCat("all")}>全部<b>{N}</b></button>
        {stackCategories.map((c) => (
          <button key={c.id} type="button" className="chip chip-lg" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}<b>{c.count}</b></button>
        ))}
      </div>
      {shown.map((c) => (
        <section key={c.id} className="shelf-group" aria-labelledby={`shelf-${c.id}`}>
          <h2 className="shelf-h" id={`shelf-${c.id}`}>{c.name}<span>{c.en}</span></h2>
          <ul className="shelf-grid">
            {stackItems.filter((i) => i.category === c.id).map((i) => (
              <li key={i.id}>
                <a className="lift shelf-card" href={i.url} target="_blank" rel="noopener">
                  <span className="lift-card shelf-media">
                    <img src={i.image} alt="" loading="lazy" decoding="async" width="800" height="516" />
                  </span>
                  <span className="shelf-caption">
                    <span className="shelf-name">{i.name}<Arrow /></span>
                    <span className="shelf-note">{i.note}</span>
                    <span className="shelf-domain">{i.domain}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="page-foot"><Footer /></div>
    </div>
  );
}

const SWITCH_COLORS = ["#00aaff", "#77ccff", "#000000"];

export default function Stack() {
  const [view, setView] = useState("wall");
  return (
    <div className={`stack is-${view}`}>
      {view === "wall" ? <h1 className="visually-hidden">Stack · 工具箱</h1> : null}
      {view === "wall" ? <Wall /> : <Shelf />}
      <div className="view-switch glass" role="group" aria-label="切换视图">
        <button type="button" aria-pressed={view === "wall"} onClick={() => setView("wall")}>画布</button>
        <PixelSprite seed={view === "wall" ? 5 : 6} n={5} colors={SWITCH_COLORS} className="view-switch-mark" />
        <button type="button" aria-pressed={view === "shelf"} onClick={() => setView("shelf")}>分类</button>
      </div>
    </div>
  );
}
