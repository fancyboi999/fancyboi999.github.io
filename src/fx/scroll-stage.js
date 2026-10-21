// vendored from multimedia-skills: web-design/web-style-extraction/assets/effects/scroll-stage/scroll-stage.js
// scroll-stage.js — "粘性舞台"滚动驱动：把滚动进度写成 CSS 变量
//
// 结构：
//   <section class="stage" style="--screens: 2.5">   ← 高度 = screens × 视口高
//     <div class="sticky">…画面…</div>             ← position: sticky; top: 0; height: 视口高
//   </section>
// 舞台滚过的距离 = 舞台高 − 视口高；progress = 已滚距离 / 总距离 ∈ [0,1]。
// 进度写到舞台元素的 --p 上，CSS 和 JS 都能读；onProgress 里再派生自己的变量。
//
//   import { scrollStage, range, steps, ease } from "./scroll-stage.js";
//   scrollStage(stage, {
//     onProgress(p, el) {
//       el.style.setProperty("--out", range(p, 0, 0.3));   // 前 30% 让旧标题离场
//       el.classList.toggle("is-swapped", p >= 0.18);      // 阈值切状态
//     },
//   });
//
// 为什么不用原生 CSS scroll-driven animation（animation-timeline: view()）：
// 它适合"单属性随滚动插值"；一旦要阈值切类名、驱动 Canvas、步进量化、多元素联动，
// JS 写变量更可控，也兼容平滑滚动库（它们最终都会触发 scroll 事件）。
// 两者不冲突：简单的进场/视差优先用原生，见 motion.css 的 .sd-reveal。

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
// 把 p 在 [a,b] 区间内线性映射到 0..1
export const range = (p, a, b) => clamp01((p - a) / (b - a));
// 量化成 n 步（像素/逐帧质感）
export const steps = (v, n) => (v <= 0 ? 0 : v >= 1 ? 1 : Math.ceil(v * n) / n);
export const ease = {
  outExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};

export function scrollStage(stage, { onProgress, scroller = window } = {}) {
  let raf = 0, last = -1;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const measure = () => {
    raf = 0;
    const r = stage.getBoundingClientRect();
    const vh = scroller === window ? innerHeight : scroller.clientHeight;
    const top = scroller === window ? r.top : r.top - scroller.getBoundingClientRect().top;
    const travel = r.height - vh;
    const p = reduced.matches || travel <= 0 ? 1 : clamp01(-top / travel);
    if (p === last) return;
    last = p;
    stage.style.setProperty("--p", p.toFixed(4));
    onProgress?.(p, stage);
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(measure); };

  scroller.addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  reduced.addEventListener?.("change", queue);
  queue();
  return {
    refresh: () => { last = -1; queue(); },
    destroy() {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    },
  };
}

// 进入视口时打一个 data-in 标记（配合 motion.css 的 [data-flow]）
export function flowIn(root = document, { threshold = 0.15 } = {}) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.dataset.in = ""; io.unobserve(e.target); }
  }, { threshold });
  root.querySelectorAll("[data-flow]").forEach((el) => io.observe(el));
  return io;
}
