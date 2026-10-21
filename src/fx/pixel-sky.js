// vendored from multimedia-skills: web-design/web-style-extraction/assets/effects/pixel-sky/pixel-sky.js
// pixel-sky.js — 像素抖动天空（Canvas 2D，无依赖）
//
// 原理：值噪声 fbm → 量化成 5 档色调 → 档与档之间用 2×2 棋盘格抖动过渡。
//   tone 0 深色实心 / 1 深·中棋盘 / 2 中色实心 / 3 中·浅棋盘 / 4 浅色(=底色)
// 每个格子还带一个 order(0..1)，绘制时只画 order <= level 的格子，
// 所以把 level 从 0 推到 1（按时间或按滚动进度、按步数量化）就得到"逐格显现/消散"。
//
// 用法：
//   import { pixelSky } from "./pixel-sky.js";
//   const sky = pixelSky(canvas, { cell: 24, seed: 7, reveal: "radial" });
//   sky.setLevel(0.5);          // 手动控制显现程度（滚动驱动时用）
//   sky.play({ ms: 600 });      // 按时间从 0 播到 1
//   sky.destroy();
// 其他选项：clear(canvas)→[{x,y,w,h}] 留白区 / feather 留白羽化格数 / cover 深色占比 /
//           shape(x01,y01)→number 按位置提亮或加深 / drift 漂移速度(px/s)
// 颜色从 canvas 的 CSS 变量读取：--sky-deep / --sky-mid / --sky-pale

export function hash3(x, y, s) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash3(xi, yi, s), b = hash3(xi + 1, yi, s);
  const c = hash3(xi, yi + 1, s), d = hash3(xi + 1, yi + 1, s);
  const top = a + (b - a) * u, bottom = c + (d - c) * u;
  return top + (bottom - top) * v;
}

export const fbm = (x, y, s) =>
  0.6 * valueNoise(x, y, s) + 0.3 * valueNoise(x * 2, y * 2, s + 1) + 0.1 * valueNoise(x * 4, y * 4, s + 2);

// 4 个阈值把 fbm 值切成 5 档；中间两档(1、3)是抖动档
const THRESHOLDS = [0.42, 0.49, 0.55, 0.61];
const toneOf = (n) => THRESHOLDS.filter((t) => n >= t).length;

function checker(ctx, a, b, px) {
  const c = document.createElement("canvas");
  c.width = c.height = px * 2;
  const g = c.getContext("2d");
  g.fillStyle = a; g.fillRect(0, 0, px * 2, px * 2);
  g.fillStyle = b; g.fillRect(0, 0, px, px); g.fillRect(px, px, px, px);
  return ctx.createPattern(c, "repeat");
}

// 生成格子数据（与 DPR 无关，单位 CSS px）
export function buildCells({ width, height, cell, seed, reveal = "radial", clear = [], feather = 3, shift = 0, cover = 0.5, shape = null }) {
  const k = 2.4 / width;             // 噪声频率随宽度缩放，保证大屏小屏云团数量相近
  const bias = (cover - 0.5) * 0.25; // cover>0.5 → 更多深色
  const cells = [];
  // 清空区（比如标题背后）：矩形内强制浅色；矩形外 feather 个格子内逐渐提亮，边缘保持像素化的有机形状
  const fade = feather * cell;
  const lift = (x, y) => {
    let best = 0;
    for (const r of clear) {
      const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
      const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
      const d = Math.hypot(dx, dy);
      best = Math.max(best, d === 0 ? 1 : fade ? Math.max(0, 1 - d / fade) : 0);
    }
    return best;
  };
  const orderOf = (x, y) => {
    const jitter = hash3(Math.round(x), Math.round(y), seed + 3) * 0.18;
    if (reveal === "radial") {
      const dx = (x - width / 2) / (width / 2), dy = (y - height / 2) / (height / 2);
      return Math.min(1, Math.hypot(dx, dy) / Math.SQRT2) * 0.82 + jitter;
    }
    if (reveal === "rows") return (1 - y / height) * 0.82 + jitter;
    return 0;
  };
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const w = Math.min(cell, width - x), h = Math.min(cell, height - y);
      const cx = x + w / 2, cy = y + h / 2;
      let sx = cx + shift, sy = cy;
      // 部分区域吸附到 3 倍大的"宏像素"，制造大小块并存的颗粒感
      if (valueNoise(sx * k * 1.3, sy * k * 1.3, seed + 7) > 0.6) {
        const big = cell * 3;
        sx = Math.floor(sx / big) * big + big / 2;
        sy = Math.floor(sy / big) * big + big / 2;
      }
      const l = lift(cx, cy);
      // shape(x01, y01)：按位置额外提亮(+)或加深(-)，用来做渐变过渡带、只在一侧出云等
      const extra = shape ? shape(cx / width, cy / height) : 0;
      const tone = l >= 1 ? 4 : toneOf(fbm(sx * k, sy * k * 2.2, seed) - bias + l * 0.35 + extra);
      if (tone === 4) continue; // 浅色就是底色，不画
      cells.push({ x, y, w, h, tone, order: orderOf(cx, cy) });
    }
  }
  return cells;
}

export function drawCells(ctx, cells, colors, level, dpr, cell) {
  const px = Math.max(1, Math.round((cell * dpr) / 10));
  const fills = [colors.deep, checker(ctx, colors.deep, colors.mid, px), colors.mid, checker(ctx, colors.mid, colors.pale, px)];
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const c of cells) {
    if (c.order > level) continue;
    ctx.fillStyle = fills[c.tone];
    ctx.fillRect(Math.round(c.x * dpr), Math.round(c.y * dpr), Math.ceil(c.w * dpr), Math.ceil(c.h * dpr));
  }
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function pixelSky(canvas, opts = {}) {
  const o = { cell: 24, seed: 1, reveal: "radial", steps: 6, drift: 0, clear: () => [], feather: 3, cover: 0.42, shape: null, ...opts };
  const ctx = canvas.getContext("2d");
  let cells = [], size = { w: 0, h: 0 }, dpr = 1, level = o.reveal === "none" ? 1 : 0, raf = 0, visible = true;
  const t0 = performance.now();

  const colors = () => {
    const cs = getComputedStyle(canvas);
    return {
      deep: cs.getPropertyValue("--sky-deep").trim() || "#0af",
      mid: cs.getPropertyValue("--sky-mid").trim() || "#7cf",
      pale: cs.getPropertyValue("--sky-pale").trim() || "#fff",
    };
  };
  const quantize = (v) => (v <= 0 ? -1 : v >= 1 ? 1 : Math.ceil(v * o.steps) / o.steps);
  const rebuild = (shift = 0) => {
    cells = buildCells({ width: size.w, height: size.h, cell: o.cell, seed: o.seed, reveal: o.reveal, clear: o.clear(canvas), feather: o.feather, shift, cover: o.cover, shape: o.shape });
  };
  const render = () => drawCells(ctx, cells, colors(), quantize(level), dpr, o.cell);

  const resize = () => {
    size = { w: canvas.clientWidth, h: canvas.clientHeight };
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    rebuild();
    render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // 漂移：横向平移噪声场，按 ~24fps 重建，离屏时暂停
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && o.drift) loop(); });
  io.observe(canvas);
  let last = 0;
  const loop = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame((now) => {
      if (!visible || !o.drift || reducedMotion()) return;
      if (now - last > 1000 / 24) { last = now; rebuild(((now - t0) / 1000) * o.drift); render(); }
      loop();
    });
  };
  if (o.drift) loop();

  return {
    setLevel(v) { level = v; render(); },
    play({ ms = 600, delay = 0, reverse = false } = {}) {
      if (reducedMotion()) { level = reverse ? 0 : 1; render(); return; }
      const start = performance.now() + delay;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / ms));
        const v = reverse ? 1 - t : t;
        if (quantize(v) !== quantize(level)) { level = v; render(); } else level = v;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    refresh: resize,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); },
  };
}

// 小像素图标：左右对称的 n×n 像素 sprite（类似 identicon），返回 canvas。
// 用于标题里的像素标记、--seed 背景、头像占位等。
export function pixelSprite({ seed = 1, n = 7, scale = 4, colors = ["#0af", "#7cf", "#000"] } = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = n * scale;
  const g = c.getContext("2d");
  const half = Math.ceil(n / 2);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < half; x++) {
      const r = hash3(x, y, seed);
      if (r < 0.42) continue;
      g.fillStyle = colors[Math.floor(hash3(x, y, seed + 11) * colors.length)];
      g.fillRect(x * scale, y * scale, scale, scale);
      g.fillRect((n - 1 - x) * scale, y * scale, scale, scale);
    }
  }
  return c;
}
