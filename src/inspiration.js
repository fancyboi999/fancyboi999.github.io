// 灵感：每条是一种设计模式。content/inspiration.json 是唯一来源，按收集日期从新到旧排列。
// 字段规范见 .agents/skills/collect-inspiration/SKILL.md，scripts/check-inspiration.mjs 在 dev/build 前校验。
import data from "../content/inspiration.json";

const domainOf = (url) => new URL(url).host.replace(/^www\./, "") + new URL(url).pathname.replace(/\/$/, "");

export const inspirations = data.items
  .map((i) => ({
    ...i,
    image: `/inspiration/${i.id}.webp`,
    video: i.source.video ? `/inspiration/${i.id}.webm` : null,
    source: { ...i.source, domain: domainOf(i.source.url) },
    similar: i.similar.map((s) => ({ ...s, domain: domainOf(s.url) })),
    kits: i.kits.map((k) => ({ ...k, domain: domainOf(k.url) })),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

export const inspirationById = Object.fromEntries(inspirations.map((i) => [i.id, i]));

// uses 里写的是本站已有条目的 id 时，详情页把它渲染成站内链接
for (const i of inspirations) i.uses = i.uses.map((u) => inspirationById[u] ?? { name: u });

export const inspirationTags = [...new Set(inspirations.flatMap((i) => i.tags))].map((name) => ({
  name,
  count: inspirations.filter((i) => i.tags.includes(name)).length,
}));
