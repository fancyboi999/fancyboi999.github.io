// 灵感：每条是一种设计模式。content/inspiration.json 是唯一来源，按收集日期从新到旧排列。
// 截图是原始设计 1440×900 视口的画面，缩成 800×500 存为 public/inspiration/<id>.webp。
import data from "../content/inspiration.json";

const domainOf = (url) => new URL(url).host.replace(/^www\./, "") + new URL(url).pathname.replace(/\/$/, "");

export const inspirations = data.items
  .map((i) => ({
    ...i,
    image: `/inspiration/${i.id}.webp`,
    source: { ...i.source, domain: domainOf(i.source.url) },
    similar: i.similar.map((s) => ({ ...s, domain: domainOf(s.url) })),
    kits: i.kits.map((k) => ({ ...k, domain: domainOf(k.url) })),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

export const inspirationById = Object.fromEntries(inspirations.map((i) => [i.id, i]));

export const inspirationTags = [...new Set(inspirations.flatMap((i) => i.tags))].map((name) => ({
  name,
  count: inspirations.filter((i) => i.tags.includes(name)).length,
}));
