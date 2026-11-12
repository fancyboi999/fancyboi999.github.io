// PROTOTYPE：只在 dev 下出现的变体切换条。?variant= 决定当前变体，←/→ 循环切换。
// 不用 useSearchParams：Shell 里每张页面卡片只在 pathname 变化时才换 location，
// 页面内读到的 search 是挂载时的旧值。所以变体状态自己持有，再用 replaceState 写回 URL。
import { useEffect, useState } from "react";

export function useVariant(keys) {
  const read = () => {
    if (typeof window === "undefined") return keys[0];
    const v = new URLSearchParams(window.location.search).get("variant");
    return keys.includes(v) ? v : keys[0];
  };
  const [v, setV] = useState(read);
  const set = (next) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    history.replaceState(history.state, "", url);
    setV(next);
  };
  return [v, set];
}

export default function PrototypeSwitcher({ variants, current, onChange }) {
  const keys = variants.map((v) => v.key);
  const i = keys.indexOf(current);
  const go = (d) => onChange(keys[(i + d + keys.length) % keys.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable], [role=dialog]")) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!import.meta.env.DEV) return null;
  return (
    <div className="proto-switch" role="group" aria-label="原型变体切换">
      <button type="button" onClick={() => go(-1)} aria-label="上一个变体">←</button>
      <span><b>{current}</b> {variants[i].name}</span>
      <button type="button" onClick={() => go(1)} aria-label="下一个变体">→</button>
    </div>
  );
}
