// 灵感收集：content/inspiration.json 是唯一来源，按收集日期从新到旧排列。
// 截图是 1440×900 视口的画面，缩成 800×500 存为 public/inspiration/<id>.webp。
import data from "../content/inspiration.json";

export const inspirations = data.items
  .map((i) => ({
    ...i,
    image: `/inspiration/${i.id}.webp`,
    domain: new URL(i.url).host.replace(/^www\./, "") + new URL(i.url).pathname.replace(/\/$/, ""),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

export const inspirationTags = [...new Set(inspirations.flatMap((i) => i.tags))].map((name) => ({
  name,
  count: inspirations.filter((i) => i.tags.includes(name)).length,
}));
