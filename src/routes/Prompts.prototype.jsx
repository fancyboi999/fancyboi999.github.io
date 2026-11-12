// PROTOTYPE · 扔掉即可。问题：/prompts/ 收藏页应该长什么样？
// 三个结构不同的变体在同一路由上，用 ?variant=A|B|C 切换（dev 下底部有切换条）。
//   A 信笺：左侧编号目录 + 右侧整页阅读，像一封信
//   B 集邮册：每条 prompt 是一张邮票，点开是信封里的全文
//   C 调配台：搜索优先，选中后自动抽出 {{变量}}，边填边看成品再复制
import { useEffect, useMemo, useRef, useState } from "react";
import { PixelSky, PixelSprite } from "../components/fx.jsx";
import { Footer } from "../components/Layout.jsx";
import PrototypeSwitcher, { useVariant } from "../components/PrototypeSwitcher.jsx";
import { seedOf } from "../content.js";
import "./prompts.prototype.css";

// 示例数据：取自 fancy 的全局 CLAUDE.md 与常用 skill。正式版放 content/prompts.json
const PROMPTS = [
  {
    id: "soul", title: "SouL · 人设", legend: ["Colleague,", "not servant"], tags: ["人设", "系统提示"], for: "Claude Code · Codex", added: "2026-03",
    why: "一句话定下合作关系：同事，不是奴仆。模型会主动指出我的错误。",
    body: `你叫 {{name}}。使用用户的语言，表达直接、客观，不谄媚，不把猜测当事实。
以第一性原理洞察问题本质，以系统性方法解决根因，避免对特定方案的路径依赖。
保持优秀的 Taste 及判断力，避免受到记忆等知识诅咒，避免变得平庸。
用户可能会出错，当用户出现明显错误或决策冲突时，毫不留情地指出。你是同事，不是奴仆。`,
  },
  {
    id: "clear", title: "Communicating clearly", legend: ["Write for", "low context"], tags: ["写作", "系统提示"], for: "所有 agent", added: "2026-05",
    why: "让长任务的汇报能被“刚切回来的人”读懂。效果最明显的一段。",
    body: `Write for an intelligent but low-context reader. The person reading has not seen your tool calls, your reasoning or the files you opened.
Put the key points in the first few sentences. Practice progressive disclosure in your sentence order.
Use plain words, and write in clear, understandable full sentences. Do not use a term or abbreviation that you made up during the work.
Write mostly in the style of ASD-STE100 Simplified Technical English: short sentences, one idea per sentence, active voice.`,
  },
  {
    id: "verify", title: "验证强度", legend: ["Verify by", "risk"], tags: ["工程", "验证"], for: "Claude Code", added: "2026-06",
    why: "防止两种极端：什么都不测，或者把改一行文案升级成全量审计。",
    body: `验证深度匹配风险，不把每个任务升级成完整审计：
- 低风险文案、文档、只读分析：做最小相关检查。
- 改变代码运行行为：运行受影响的定向测试或静态检查，并覆盖相关异常和边界。
- 涉及 {{boundary}}：在对应真实边界补充验证；单测和 mock 不能替代未触达的真实边界。
- 写代码前明确要证明的行为；修复问题时尽量保留修复前失败证据，并用相同触发条件复验。`,
  },
  {
    id: "report", title: "长程任务收尾汇报", legend: ["Report", "the ending"], tags: ["写作", "工程"], for: "Claude Code · Codex", added: "2026-07",
    why: "固定的五段结构，读最终回复就够了，不用翻过程。",
    body: `长程任务交付按以下顺序给出：
### 结果 —— 交付了什么、当前状态和产物位置。
### 依据 —— 问题 / 原因 / 证据 / 修正 / 修正后的行为。
### 验证 —— 检查 / 命令 / 实际结果 / 未覆盖范围。
### 相邻发现 —— 一句 TL;DR，再列有证据的发现。
### 剩余 TODO —— 只列实际剩余事项，无则写“无”。`,
  },
  {
    id: "grill", title: "Grill me", legend: ["Grill", "relentlessly"], tags: ["思考", "评审"], for: "任意对话", added: "2026-08",
    why: "方案拍板前用它压测一遍，问题一个一个问，不给我含糊过去。",
    body: `Interview me relentlessly about {{plan}} until we reach a shared understanding.
Walk down each branch of the decision tree, resolving dependencies between decisions one by one.
Ask one question at a time. For each question, give your recommended answer.
If a question can be answered by exploring the codebase, explore it instead of asking.`,
  },
  {
    id: "slop", title: "Stop slop", legend: ["No more", "AI tells"], tags: ["写作", "评审"], for: "改稿", added: "2026-09",
    why: "专门去掉“不是……而是……”、三连排比这些一眼 AI 的句式。",
    body: `Rewrite the following text to remove predictable AI writing patterns.
Cut: "not X, but Y" framings, triplets, hedges, throat-clearing openers, and summary closers.
Keep the author's meaning and voice. Prefer concrete nouns and plain verbs.
Language: {{language}}

Text:
{{text}}`,
  },
];
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
function VariantA() {
  const [cur, setCur] = useState(PROMPTS[0].id);
  const [done, copy] = useCopy();
  const p = PROMPTS.find((x) => x.id === cur);
  const no = PROMPTS.indexOf(p) + 1;
  return (
    <div className="page pa">
      <header className="page-head">
        <p className="kicker">{PROMPTS.length} 条 · 每天都在用</p>
        <h1 className="page-title">Prompts</h1>
      </header>
      <div className="pa-split">
        <ol className="pa-index">
          {PROMPTS.map((x, i) => (
            <li key={x.id}>
              <button type="button" aria-current={x.id === cur} onClick={() => setCur(x.id)}>
                <span className="pa-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="pa-t">{x.title}</span>
                <span className="pa-tags">{x.tags[0]}</span>
              </button>
            </li>
          ))}
        </ol>
        <article className="pa-letter" key={p.id}>
          <span className="pa-stamp" style={{ "--sky-deep": INKS[(no - 1) % 4].deep, "--sky-mid": INKS[(no - 1) % 4].mid, "--sky-pale": "#fff" }}>
            <PixelSky className="pa-stamp-sky" options={{ cell: 5, seed: seedOf(p.id) % 100000, reveal: "none", cover: 0.55, feather: 0 }} />
          </span>
          <p className="pa-meta">No.{String(no).padStart(2, "0")} · {p.added} · {p.for}</p>
          <h2 className="pa-h">{p.legend.join(" ")}</h2>
          <p className="pa-why">{p.why}</p>
          <pre className="pa-body"><Body text={p.body} /></pre>
          <div className="pa-foot">
            <div className="chips">{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <CopyPill id={p.id} text={p.body} done={done} copy={copy} />
          </div>
        </article>
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
