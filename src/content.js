// 文章数据：元信息随主包加载；正文按篇懒加载并缓存。
// 预渲染时由 entry-server 预先全部加载，客户端在 hydrate 前预取当前文章，保证首屏一致。
import data from "./generated/posts.json";

export const { posts, tags, categories } = data;
export const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));
export const termSlug = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "-");

const loaders = import.meta.glob("./generated/posts/*.json", { import: "default" });
const cache = new Map();

export const getBody = (slug) => cache.get(slug);
export async function loadBody(slug) {
  if (cache.has(slug)) return cache.get(slug);
  const load = loaders[`./generated/posts/${slug}.json`];
  if (!load) return null;
  const body = await load();
  cache.set(slug, body);
  return body;
}

export const formatDate = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  // 统一按北京时间显示，避免 SSR(UTC) 与浏览器时区不一致导致 hydrate 差异
  const bj = new Date(d.getTime() + 8 * 3600 * 1000);
  return `${bj.getUTCFullYear()}.${pad(bj.getUTCMonth() + 1)}.${pad(bj.getUTCDate())}`;
};
export const yearOf = (iso) => formatDate(iso).slice(0, 4);

// 字符串 → 稳定的数字种子（给每篇文章生成专属像素图）
export const seedOf = (s) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
};
