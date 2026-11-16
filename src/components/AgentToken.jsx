// 句子里的工具胶囊：轮流显示一组 agent，点击立即换到下一个。
// 悬停或键盘聚焦时停止自动轮换，交给用户自己点；paused 由外部（滚动离开首屏）控制。
// 宽度按每个候选词实测后过渡，后面的文字平滑让开；换词用 Torph 逐字母变形。
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";
import "./agent-token.css";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const FIRST_MS = 1600; // 等标题逐词入场后再开始换
const EVERY_MS = 2200;

export default function AgentToken({ items, paused = false, onMeasure }) {
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState(null); // 正在退场的图标序号
  const [held, setHeld] = useState(false);
  const [tick, setTick] = useState(0);
  const [widths, setWidths] = useState(null);
  const sizers = useRef(null);
  const moved = useRef(false);

  // 量出每个候选词撑开的整颗胶囊宽度；字号随视口变化时重量
  useIsoLayout(() => {
    const box = sizers.current;
    const measure = () => {
      // 用布局宽度：入场时外层词带 scale 动画，getBoundingClientRect 会量到缩小后的值
      const ws = [...box.children].map((n) => n.offsetWidth + 1);
      const fs = parseFloat(getComputedStyle(box).fontSize);
      setWidths(ws);
      onMeasure?.(Math.max(...ws) / fs);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [items, onMeasure]);

  const advance = () => {
    moved.current = true;
    setLeaving(idx);
    setIdx((idx + 1) % items.length);
  };

  // idx 变化（自动或点击）都会重新计时，点完不会紧接着又被自动换掉
  useEffect(() => {
    if (paused || held) return;
    const t = setTimeout(() => {
      if (document.hidden) return setTick((n) => n + 1); // 后台标签页不换，只重新计时
      advance();
    }, moved.current ? EVERY_MS : FIRST_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, tick, paused, held, items.length]);

  const cur = items[idx];
  const next = items[(idx + 1) % items.length];

  return (
    <button
      type="button"
      className="agent-token"
      aria-label={`${cur.label}，点击换成 ${next.label}`}
      onClick={advance}
      style={widths ? { width: widths[idx] } : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <span className="agent-token-icons" aria-hidden="true">
        {leaving != null && leaving !== idx ? (
          <Icon key={`out-${leaving}`} item={items[leaving]} className="is-out" onAnimationEnd={() => setLeaving(null)} />
        ) : null}
        <Icon key={`in-${idx}`} item={cur} className={moved.current ? "is-in" : ""} />
      </span>
      <span className="agent-token-label" aria-hidden="true">
        <TextMorph as="span">{cur.label}</TextMorph>
      </span>
      <span className="agent-token-sizers" ref={sizers} aria-hidden="true">
        {items.map((it) => <span key={it.label} className="agent-token-sizer">{it.label}</span>)}
      </span>
    </button>
  );
}

function Icon({ item, className, onAnimationEnd }) {
  return (
    <span className={`agent-token-icon ${className}`} style={{ "--tilt": `${item.tilt || 0}deg` }} onAnimationEnd={onAnimationEnd}>
      {item.icon}
    </span>
  );
}
