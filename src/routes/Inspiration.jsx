// 灵感：列表页是模式卡片墙（筛选和卡片沿用 /stack/ 分类视图的样式），详情页是一个模式的完整拆解。
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { inspirations, inspirationById, inspirationTags } from "../inspiration.js";
import { Arrow, Footer } from "../components/Layout.jsx";
import NotFound from "./NotFound.jsx";
import "./inspiration.css";

export function InspirationIndex() {
  const [tag, setTag] = useState("all");
  const shown = tag === "all" ? inspirations : inspirations.filter((i) => i.tags.includes(tag));
  return (
    <div className="page shelf">
      <header className="page-head">
        <p className="kicker">{inspirations.length} 种设计 · 最近 {inspirations[0].date}</p>
        <h1 className="page-title">Inspiration</h1>
        <p className="shelf-lead">看到喜欢的设计，记下它叫什么、为什么成立、怎么拆，再配上同类的网站和能直接用的库。</p>
      </header>
      <div className="cloud shelf-filter" role="group" aria-label="按标签筛选">
        <button type="button" className="chip chip-lg" aria-pressed={tag === "all"} onClick={() => setTag("all")}>全部<b>{inspirations.length}</b></button>
        {inspirationTags.map((t) => (
          <button key={t.name} type="button" className="chip chip-lg" aria-pressed={tag === t.name} onClick={() => setTag(t.name)}>{t.name}<b>{t.count}</b></button>
        ))}
      </div>
      <ul className="shelf-grid">
        {shown.map((i) => (
          <li key={i.id}>
            <Link className="lift shelf-card" to={`/inspiration/${i.id}/`}>
              <span className="lift-card shelf-media insp-media">
                <img src={i.image} alt="" loading="lazy" decoding="async" width="800" height="500" />
              </span>
              <span className="shelf-caption">
                <span className="shelf-name">{i.name}<span className="insp-aka">{i.aka[0]}</span></span>
                <span className="shelf-note">{i.summary}</span>
                <span className="shelf-domain">{i.source.title} · {i.tags.join(" / ")} · {i.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="page-foot"><Footer /></div>
    </div>
  );
}

// 实时预览：按 1440×900 的桌面视口渲染对方网站，再整体缩放到容器宽度。
// 只给 JSON 里标了 embed 的网站用（对方允许被 iframe 嵌入，且实测不会跳出）；
// sandbox 不给 allow-top-navigation，对方脚本无法把整页带走。
const FRAME_W = 1440;
function LiveFrame({ url, title }) {
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(() => el.style.setProperty("--s", el.clientWidth / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span className="insp-frame" ref={box}>
      <iframe src={url} title={`${title} 实时预览`} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerPolicy="no-referrer" />
    </span>
  );
}

function External({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`insp-link${open ? " is-open" : ""}`}>
      <a className="insp-link-title" href={item.url} target="_blank" rel="noopener">{item.title}<Arrow /></a>
      {item.kind ? <span className="chip insp-kind">{item.kind}</span> : null}
      <span className="insp-link-note">{item.note}</span>
      <span className="insp-link-foot">
        <span className="shelf-domain">{item.domain}</span>
        {item.embed ? <button type="button" className="insp-peek" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "收起" : "预览"}</button> : null}
      </span>
      {open ? <LiveFrame url={item.url} title={item.title} /> : null}
    </div>
  );
}

export function InspirationDetail() {
  const { id } = useParams();
  const item = inspirationById[id];
  if (!item) return <NotFound />;
  return (
    <article className="page insp">
      <header className="page-head">
        <p className="kicker"><Link to="/inspiration/">Inspiration</Link> · {item.date} · {item.tags.join(" / ")}</p>
        <h1 className="page-title">{item.name}</h1>
        <div className="chips">{item.aka.map((a) => <span key={a} className="chip">{a}</span>)}</div>
        <p className="shelf-lead">{item.summary}</p>
      </header>

      {item.source.embed ? (
        <div className="insp-hero">
          <LiveFrame url={item.source.url} title={item.source.title} />
          <a className="shelf-domain" href={item.source.url} target="_blank" rel="noopener">原始设计 · {item.source.title} · {item.source.domain} ↗</a>
        </div>
      ) : (
        <a className="lift insp-hero" href={item.source.url} target="_blank" rel="noopener">
          <span className="lift-card shelf-media insp-media">
            <img src={item.image} alt={`${item.source.title} 首屏截图`} decoding="async" width="800" height="500" />
          </span>
          <span className="shelf-domain">原始设计 · {item.source.title} · {item.source.domain}</span>
        </a>
      )}

      <section className="insp-sec" aria-labelledby="insp-why">
        <h2 className="insp-h" id="insp-why">为什么成立</h2>
        <p className="insp-principle">{item.principle}</p>
      </section>

      <section className="insp-sec" aria-labelledby="insp-parts">
        <h2 className="insp-h" id="insp-parts">拆解</h2>
        <ol className="insp-parts">
          {item.parts.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.how}</p>
            </li>
          ))}
        </ol>
        <p className="insp-recipe"><b>最省事的做法</b>{item.recipe}</p>
      </section>

      <section className="insp-sec" aria-labelledby="insp-similar">
        <h2 className="insp-h" id="insp-similar">同类设计</h2>
        <div className="insp-links">{item.similar.map((s) => <External key={s.url} item={s} />)}</div>
      </section>

      <section className="insp-sec" aria-labelledby="insp-kits">
        <h2 className="insp-h" id="insp-kits">直接能用</h2>
        <div className="insp-links">{item.kits.map((k) => <External key={k.url} item={k} />)}</div>
      </section>

      <section className="insp-sec" aria-labelledby="insp-search">
        <h2 className="insp-h" id="insp-search">搜索关键词</h2>
        <div className="chips">{item.search.map((q) => <code key={q} className="insp-q">{q}</code>)}</div>
      </section>

      <div className="page-foot"><Footer /></div>
    </article>
  );
}
