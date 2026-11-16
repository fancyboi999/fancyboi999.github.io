// React 外壳：把 src/fx 里的原生特效挂到组件上。SSR 时只输出空 canvas / 静态结构。
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { pixelSky, pixelSprite } from "../fx/pixel-sky.js";

export const PixelSky = forwardRef(function PixelSky({ className, options, play }, ref) {
  const canvas = useRef(null);
  const sky = useRef(null);
  useImperativeHandle(ref, () => ({
    setLevel: (v) => sky.current?.setLevel(v),
    refresh: () => sky.current?.refresh(),
  }));
  const key = JSON.stringify({ ...options, clear: undefined, shape: undefined });
  useEffect(() => {
    sky.current = pixelSky(canvas.current, options);
    if (play) sky.current.play(play);
    document.fonts?.ready.then(() => sky.current?.refresh());
    return () => sky.current?.destroy();
    // options 里的函数（clear/shape）随渲染变化，只按可序列化部分重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <canvas ref={canvas} className={className} aria-hidden="true" />;
});

export function PixelSprite({ seed, n = 7, colors, className, label }) {
  const canvas = useRef(null);
  useEffect(() => {
    const src = pixelSprite({ seed, n, scale: 1, colors });
    const c = canvas.current;
    c.width = c.height = n;
    const g = c.getContext("2d");
    g.clearRect(0, 0, n, n);
    g.drawImage(src, 0, 0);
  }, [seed, n, colors]);
  return <canvas ref={canvas} className={`sprite ${className || ""}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} />;
}

// 与 fx/word-swap.css 对应的结构；用 swapped / out 控制状态
// 词表记号："/" 换行（每行不折行）；"{slot}" 是图标方块位；其他 "{名字}" 填 slots[名字]，按一个词入场退场。
// 装饰性的词对读屏隐藏，由标题的 aria-label 朗读；slots 里的控件保持可聚焦、可读。
export function WordSwap({ as: Tag = "h1", before, after, swapped, out = 0, slot, slots, className = "", label, markFill }) {
  const line = (words, cls, extra) => {
    let i = 0;
    const word = (w, k) => {
      const sep = k ? " " : null;
      const idx = i++;
      if (w === "{slot}") return [sep, <span key={k} className="ws-slot" style={{ "--i": idx }} aria-hidden="true">{slot}</span>];
      const named = /^\{(.+)\}$/.exec(w);
      // *词* 表示强调：换成标题的衬线斜体
      const accent = !named && /^\*.+\*$/.test(w);
      return [
        sep,
        <span key={k} className={`ws-word${accent ? " is-accent" : ""}`} data-side={idx % 2 ? "right" : "left"} style={{ "--i": idx }} aria-hidden={named ? undefined : "true"}>
          <span className="ws-mark" />
          <span className="ws-text">{named ? slots?.[named[1]] : accent ? w.slice(1, -1) : w}</span>
        </span>,
      ];
    };
    const rows = [[]];
    for (const w of words) w === "/" ? rows.push([]) : rows.at(-1).push(w);
    return (
      <span className={`ws-line ${cls}`} {...extra}>
        {rows.length === 1
          ? rows[0].map(word)
          : rows.map((r, n) => <span key={n} className="ws-row">{r.map(word)}</span>)}
      </span>
    );
  };
  const words = (after || before).filter((w) => w !== "/" && !/^\{.+\}$/.test(w)).map((w) => w.replace(/^\*(.+)\*$/, "$1"));
  return (
    <Tag
      className={`ws ${swapped ? "is-swapped" : ""} ${className}`}
      aria-label={label || words.join(" ")}
      style={{ "--out": out, ...(markFill ? { "--ws-mark-fill": markFill } : null) }}
    >
      {/* 换句后旧句里的控件不再可点 */}
      {line(before, "ws-before", after ? { inert: swapped || undefined } : null)}
      {after ? line(after, "ws-after", { "aria-hidden": "true", inert: !swapped || undefined }) : null}
    </Tag>
  );
}

// 进入视口回调一次
export function useInView(ref, cb, { threshold = 0.2 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
