// PROTOTYPE · 扔掉即可。问题：/prompts/ 收藏页应该长什么样？
// 三个结构不同的变体在同一路由上，用 ?variant=A|B|C 切换（dev 下底部有切换条）。
//   A 信笺：左侧编号目录 + 右侧整页阅读，像一封信
//   B 集邮册：每条 prompt 是一张邮票，点开是信封里的全文
//   C 调配台：搜索优先，选中后自动抽出 {{变量}}，边填边看成品再复制
import { useEffect, useMemo, useRef, useState } from "react";
import { PixelSky, PixelSprite } from "../components/fx.jsx";
import { Arrow, Footer } from "../components/Layout.jsx";
import PrototypeSwitcher, { useVariant } from "../components/PrototypeSwitcher.jsx";
import { seedOf } from "../content.js";
import { prompts } from "../prompts.js";
import "./prompts.prototype.css";

// 数据来自 content/prompts.json；B、C 两个变体沿用旧字段名 added / for
const PROMPTS = prompts.map((p) => ({ ...p, added: p.date.slice(0, 7), for: p.author }));
const ALL_TAGS = [...new Set(PROMPTS.flatMap((p) => p.tags))];
const INKS = [
  { deep: "#00aaff", mid: "#99ddff", text: "#007ab8" },
  { deep: "#ff9900", mid: "#ffd699", text: "#a86500" },
  { deep: "#ff3fa4", mid: "#ffb3db", text: "#d13486" },
  { deep: "#2fc47a", mid: "#a6e9c6", text: "#208553" },
];
const varsOf = (body) => [...new Set([...body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];

function useCopy() {
  const [done, setDone] = useState(null);
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* 原型：忽略 */ }
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

// 正文里的 {{变量}} 高亮成小胶囊
function Body({ text, values }) {
  return text.split(/(\{\{\w+\}\})/g).map((s, i) => {
    const m = s.match(/^\{\{(\w+)\}\}$/);
    if (!m) return s;
    const v = values?.[m[1]];
    return <span key={i} className={`pv-var${v ? " is-filled" : ""}`}>{v || m[1]}</span>;
  });
}

/* ---------------- A · 信笺 ---------------- */
// 搜索：空格分词，每个词都要命中标题、英文短句、理由、正文、标签或用途之一
const haystack = (p) => [p.title, p.legend.join(" "), p.why, p.body, p.zh, p.author, p.role, ...p.tags].join(" ").toLowerCase();
function search(q) {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return terms.length ? PROMPTS.filter((p) => terms.every((t) => haystack(p).includes(t))) : PROMPTS;
}
// 标题里把命中的词标出来
function Mark({ text, q }) {
  const terms = q.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return text;
  return text.split(new RegExp(`(${terms.join("|")})`, "gi")).map((s, i) => (i % 2 ? <mark key={i}>{s}</mark> : s));
}

function VariantA() {
  const [q, setQ] = useState("");
  const [picked, setCur] = useState(PROMPTS[0].id);
  const [done, copy] = useCopy();
  const input = useRef(null);
  const list = useMemo(() => search(q), [q]);
  // 选中项被搜索过滤掉时，落到结果第一条
  const cur = list.some((x) => x.id === picked) || !list.length ? picked : list[0].id;
  const p = list.length ? PROMPTS.find((x) => x.id === cur) : null;
  const no = (x) => String(PROMPTS.indexOf(x) + 1).padStart(2, "0");

  useEffect(() => {
    const k = (e) => {
      if (e.key !== "/" || e.target.closest?.("input, textarea")) return;
      e.preventDefault();
      input.current.focus();
      input.current.select();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const onKey = (e) => {
    const i = list.findIndex((x) => x.id === cur);
    if (e.key === "ArrowDown" && list.length) { e.preventDefault(); setCur(list[Math.min(i + 1, list.length - 1)].id); }
    if (e.key === "ArrowUp" && list.length) { e.preventDefault(); setCur(list[Math.max(i - 1, 0)].id); }
    if (e.key === "Enter" && p) copy(p.id, p.body);
    if (e.key === "Escape") { if (q) setQ(""); else input.current.blur(); }
  };

  return (
    <div className="page pa">
      <header className="page-head">
        <p className="kicker">{q ? `${list.length} / ${PROMPTS.length} 条` : `${PROMPTS.length} 条`}</p>
        <h1 className="page-title">Prompts</h1>
      </header>
      <div className="pa-split">
        <aside className="pa-side">
          <label className="pa-search">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>
            <span className="visually-hidden">搜索 prompt</span>
            <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="搜索标题、正文、标签" autoComplete="off" spellCheck="false" />
            {q ? <button type="button" className="pa-clear" onClick={() => { setQ(""); input.current.focus(); }} aria-label="清空搜索">×</button> : <kbd>/</kbd>}
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
            <pre className="pa-body" lang="en"><Body text={p.body} /></pre>
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

/* ---------------- B · 集邮册 ---------------- */
function PromptStamp({ p, i, onOpen }) {
  const ink = INKS[i % 4];
  const turn = (i % 2 ? 1 : -1) * (0.5 + (seedOf(p.id) % 1000) / 2000) * 3;
  return (
    <button type="button" className="stamp pb-stamp" onClick={() => onOpen(p.id)} aria-label={p.title} style={{ "--turn": `${turn.toFixed(2)}deg`, "--stamp-ink": ink.text }}>
      <span className="stamp-lift">
        <span className="stamp-sheet" aria-hidden="true">
          <span className="stamp-paper" />
          <span className="stamp-field" style={{ "--sky-deep": ink.deep, "--sky-mid": ink.mid, "--sky-pale": "#fff" }}>
            <PixelSky className="stamp-sky" options={{ cell: 6, seed: seedOf(p.id) % 100000, reveal: "none", cover: 0.55, feather: 0 }} />
          </span>
          <span className="stamp-words">
            <span className="stamp-told">
              <span className="stamp-issued">{p.added}</span>
              <span className="stamp-title">{p.legend.map((l) => <span key={l}>{l}</span>)}</span>
            </span>
            <span className="stamp-count">{String(i + 1).padStart(2, "0")}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

function VariantB() {
  const [tag, setTag] = useState("all");
  const [open, setOpen] = useState(null);
  const [done, copy] = useCopy();
  const p = PROMPTS.find((x) => x.id === open);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <div className="page pb">
      <header className="pb-head">
        <h1 className="pb-title">Prompt <em>Album</em></h1>
        <p className="pb-lead">收藏的每一段 prompt 都印成一张邮票。点一张，拆开信封看全文。</p>
      </header>
      <div className="cloud shelf-filter" role="group" aria-label="按标签筛选">
        <button type="button" className="chip chip-lg" aria-pressed={tag === "all"} onClick={() => setTag("all")}>全部<b>{PROMPTS.length}</b></button>
        {ALL_TAGS.map((t) => (
          <button key={t} type="button" className="chip chip-lg" aria-pressed={tag === t} onClick={() => setTag(t)}>{t}<b>{PROMPTS.filter((x) => x.tags.includes(t)).length}</b></button>
        ))}
      </div>
      <ul className="pb-album">
        {PROMPTS.map((x, i) => (
          <li key={x.id} className={tag === "all" || x.tags.includes(tag) ? "" : "is-dim"}>
            <PromptStamp p={x} i={i} onOpen={setOpen} />
          </li>
        ))}
      </ul>
      {p ? (
        <div className="pb-veil" onClick={() => setOpen(null)}>
          <div className="pb-envelope" role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}>
            <div className="pb-env-top">
              <span className="kicker">{p.added} · {p.for}</span>
              <button type="button" className="pb-close" onClick={() => setOpen(null)} aria-label="关闭">×</button>
            </div>
            <h2 className="pb-env-h">{p.title}</h2>
            <p className="pa-why">{p.why}</p>
            <pre className="pa-body"><Body text={p.body} /></pre>
            <div className="pa-foot">
              <div className="chips">{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <CopyPill id={p.id} text={p.body} done={done} copy={copy} />
            </div>
          </div>
        </div>
      ) : null}
      <div className="page-foot"><Footer /></div>
    </div>
  );
}

/* ---------------- C · 调配台 ---------------- */
function VariantC() {
  const [q, setQ] = useState("");
  const [picked, setCur] = useState(PROMPTS[0].id);
  const [values, setValues] = useState({});
  const [done, copy] = useCopy();
  const input = useRef(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? PROMPTS.filter((p) => [p.title, p.why, p.body, ...p.tags].join(" ").toLowerCase().includes(s)) : PROMPTS;
  }, [q]);
  // 选中项被搜索过滤掉时，落到结果第一条
  const cur = list.some((x) => x.id === picked) || !list.length ? picked : list[0].id;
  const p = PROMPTS.find((x) => x.id === cur);
  const vars = varsOf(p.body);
  const filled = p.body.replace(/\{\{(\w+)\}\}/g, (m, k) => values[k] || m);
  useEffect(() => {
    const k = (e) => { if (e.key === "/" && document.activeElement !== input.current) { e.preventDefault(); input.current.focus(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const onKey = (e) => {
    const i = list.findIndex((x) => x.id === cur);
    if (e.key === "ArrowDown" && list.length) { e.preventDefault(); setCur(list[Math.min(i + 1, list.length - 1)].id); }
    if (e.key === "ArrowUp" && list.length) { e.preventDefault(); setCur(list[Math.max(i - 1, 0)].id); }
    if (e.key === "Enter") copy(cur, filled);
  };
  return (
    <div className="page pc">
      <header className="pc-head">
        <PixelSprite seed={11} n={7} colors={["#00aaff", "#77ccff", "#000000"]} className="pc-mark" />
        <label className="pc-search glass">
          <span className="visually-hidden">搜索 prompt</span>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="找一段 prompt…" autoFocus />
          <kbd>/</kbd>
        </label>
        <p className="pc-hint">↑↓ 选择 · Enter 复制成品</p>
      </header>
      <div className="pc-desk">
        <ul className="pc-list" role="listbox" aria-label="结果">
          {list.map((x) => (
            <li key={x.id} role="option" aria-selected={x.id === cur} onClick={() => setCur(x.id)}>
              <span className="pc-t">{x.title}</span>
              <span className="pc-why">{x.why}</span>
              <span className="pc-n">{varsOf(x.body).length ? `${varsOf(x.body).length} 个变量` : "直接用"}</span>
            </li>
          ))}
          {!list.length ? <li className="pc-empty">没有匹配的 prompt</li> : null}
        </ul>
        <section className="pc-bench">
          {vars.length ? (
            <div className="pc-fields">
              {vars.map((v) => (
                <label key={v}>
                  <span>{v}</span>
                  <input value={values[v] || ""} onChange={(e) => setValues({ ...values, [v]: e.target.value })} placeholder={`填写 ${v}`} />
                </label>
              ))}
            </div>
          ) : null}
          <div className="pc-out">
            <div className="pc-out-bar">
              <span>{p.title}</span>
              <button type="button" onClick={() => copy(p.id, filled)}>{done === p.id ? "已复制" : "复制成品"}</button>
            </div>
            <pre><Body text={p.body} values={values} /></pre>
          </div>
        </section>
      </div>
      <div className="page-foot"><Footer /></div>
    </div>
  );
}

const VARIANTS = [
  { key: "A", name: "信笺 · 目录加阅读", C: VariantA },
  { key: "B", name: "集邮册 · 邮票加信封", C: VariantB },
  { key: "C", name: "调配台 · 搜索加填变量", C: VariantC },
];

export default function PromptsPrototype() {
  const [v, setV] = useVariant(VARIANTS.map((x) => x.key));
  const { C } = VARIANTS.find((x) => x.key === v);
  return (
    <>
      <C key={v} />
      <PrototypeSwitcher variants={VARIANTS} current={v} onChange={setV} />
    </>
  );
}
