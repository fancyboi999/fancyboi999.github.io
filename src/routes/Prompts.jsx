import { useEffect, useMemo, useRef, useState } from "react";
import { PixelSky } from "../components/fx.jsx";
import { Arrow, Footer } from "../components/Layout.jsx";
import { seedOf } from "../content.js";
import { prompts } from "../prompts.js";
import "./prompts.css";

const ALL_TAGS = [...new Set(prompts.flatMap((p) => p.tags))];
const INKS = [
  { deep: "#00aaff", mid: "#99ddff", text: "#007ab8" },
  { deep: "#ff9900", mid: "#ffd699", text: "#a86500" },
  { deep: "#ff3fa4", mid: "#ffb3db", text: "#d13486" },
  { deep: "#2fc47a", mid: "#a6e9c6", text: "#208553" },
];

function useCopy() {
  const [done, setDone] = useState(null);
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* 忽略错误 */ }
    setDone(id);
    setTimeout(() => setDone((d) => (d === id ? null : d)), 1400);
  };
  return [done, copy];
}

function CopyPill({ id, text, done, copy, children = "复制" }) {
  return (
    <button type="button" className="pill" onClick={() => copy(id, text)}>
      {done === id ? "已复制" : children}
    </button>
  );
}

// 搜索：空格分词，每个词都要命中标题、英文短句、理由、正文、标签或用途之一
const haystack = (p) => [p.title, p.legend.join(" "), p.why, p.body, p.zh, p.author, p.role, ...p.tags].join(" ").toLowerCase();
function search(q) {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return terms.length ? prompts.filter((p) => terms.every((t) => haystack(p).includes(t))) : prompts;
}

// 标题里把命中的词标出来
function Mark({ text, q }) {
  const terms = q.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return text;
  return text.split(new RegExp(`(${terms.join("|")})`, "gi")).map((s, i) => (i % 2 ? <mark key={i}>{s}</mark> : s));
}

export default function Prompts() {
  const [q, setQ] = useState("");
  const [picked, setCur] = useState(prompts[0]?.id);
  const [done, copy] = useCopy();
  const input = useRef(null);
  const list = useMemo(() => search(q), [q]);
  // 选中项被搜索过滤掉时，落到结果第一条
  const cur = list.some((x) => x.id === picked) || !list.length ? picked : list[0]?.id;
  const p = list.length ? prompts.find((x) => x.id === cur) : null;
  const no = (x) => String(prompts.indexOf(x) + 1).padStart(2, "0");

  useEffect(() => {
    const k = (e) => {
      if (e.key !== "/" || e.target.closest?.("input, textarea")) return;
      e.preventDefault();
      input.current?.focus();
      input.current?.select();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const onKey = (e) => {
    const i = list.findIndex((x) => x.id === cur);
    if (e.key === "ArrowDown" && list.length) { e.preventDefault(); setCur(list[Math.min(i + 1, list.length - 1)].id); }
    if (e.key === "ArrowUp" && list.length) { e.preventDefault(); setCur(list[Math.max(i - 1, 0)].id); }
    if (e.key === "Enter" && p) copy(p.id, p.body);
    if (e.key === "Escape") { if (q) setQ(""); else input.current?.blur(); }
  };

  return (
    <div className="page pa">
      <header className="page-head">
        <p className="kicker">{q ? `${list.length} / ${prompts.length} 条` : `${prompts.length} 条`}</p>
        <h1 className="page-title">Prompts</h1>
      </header>
      <div className="pa-split">
        <aside className="pa-side">
          <label className="pa-search">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>
            <span className="visually-hidden">搜索 prompt</span>
            <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="搜索标题、正文、标签" autoComplete="off" spellCheck="false" />
            {q ? <button type="button" className="pa-clear" onClick={() => { setQ(""); input.current?.focus(); }} aria-label="清空搜索">×</button> : <kbd>/</kbd>}
          </label>
          <ol className="pa-index" aria-label="prompt 目录">
            {list.map((x) => (
              <li key={x.id}>
                <button type="button" aria-current={x.id === cur} onClick={() => setCur(x.id)}>
                  <span className="pa-no">{no(x)}</span>
                  <span className="pa-t"><Mark text={x.title} q={q} /></span>
                  <span className="pa-tags">{x.tags[0]}</span>
                </button>
              </li>
            ))}
          </ol>
          {q && list.length ? <p className="pa-keys">↑↓ 选择 · Enter 复制 · Esc 清空</p> : null}
        </aside>
        {p ? (
          <article className="pa-letter" key={p.id}>
            <span className="pa-stamp" style={{ "--sky-deep": INKS[(+no(p) - 1) % 4].deep, "--sky-mid": INKS[(+no(p) - 1) % 4].mid, "--sky-pale": "#fff" }}>
              <PixelSky className="pa-stamp-sky" options={{ cell: 5, seed: seedOf(p.id) % 100000, reveal: "none", cover: 0.55, feather: 0 }} />
            </span>
            <p className="pa-meta">No.{no(p)}{p.date ? ` · ${p.date}` : ""}</p>
            <h2 className="pa-h">{p.legend.join(" ")}</h2>
            <p className="pa-why">{p.why}</p>
            <pre className="pa-body" lang="en">{p.body}</pre>
            {p.zh ? <p className="pa-zh">{p.zh}</p> : null}
            {p.note ? <p className="pa-note">{p.note}</p> : null}
            <p className="pa-sign">
              <span>— {p.author}</span>
              {p.role ? <span className="pa-role">{p.role}</span> : null}
              <a href={p.source.url} target="_blank" rel="noopener">{p.source.label}<Arrow /></a>
            </p>
            <div className="pa-foot">
              <div className="chips">
                {p.tags.map((t) => <button key={t} type="button" className="chip pa-tag" onClick={() => setQ(t)}>{t}</button>)}
              </div>
              <CopyPill id={p.id} text={p.body} done={done} copy={copy} />
            </div>
          </article>
        ) : (
          <div className="pa-empty">
            <p className="pa-h">Nothing here.</p>
            <p className="pa-why">没有找到“{q}”。试试换个词，或者按标签找：</p>
            <div className="chips">{ALL_TAGS.map((t) => <button key={t} type="button" className="chip pa-tag" onClick={() => setQ(t)}>{t}</button>)}</div>
          </div>
        )}
      </div>
      <div className="page-foot"><Footer /></div>
    </div>
  );
}
