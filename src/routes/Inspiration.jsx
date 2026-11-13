// 灵感：看到的好网站和设计截下来，写一句想借鉴什么。筛选和卡片沿用 /stack/ 分类视图的样式。
import { useState } from "react";
import { inspirations, inspirationTags } from "../inspiration.js";
import { Arrow, Footer } from "../components/Layout.jsx";

export default function Inspiration() {
  const [tag, setTag] = useState("all");
  const shown = tag === "all" ? inspirations : inspirations.filter((i) => i.tags.includes(tag));
  return (
    <div className="page shelf">
      <header className="page-head">
        <p className="kicker">{inspirations.length} 条 · 最近 {inspirations[0].date}</p>
        <h1 className="page-title">Inspiration</h1>
        <p className="shelf-lead">平时看到的好网站和设计，截一张图，记下想借鉴的地方。</p>
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
            <a className="lift shelf-card" href={i.url} target="_blank" rel="noopener">
              <span className="lift-card shelf-media insp-media">
                <img src={i.image} alt="" loading="lazy" decoding="async" width="800" height="500" />
              </span>
              <span className="shelf-caption">
                <span className="shelf-name">{i.title}<Arrow /></span>
                <span className="shelf-note">{i.note}</span>
                <span className="shelf-domain">{i.domain} · {i.tags.join(" / ")} · {i.date}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="page-foot"><Footer /></div>
    </div>
  );
}
