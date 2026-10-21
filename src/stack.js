// 工具箱数据：content/stack.json 是唯一来源（浏览器书签也按它整理）。
// 封面是各官网首屏截图，存在 public/stack/<id>.webp。
import data from "../content/stack.json";

export const stackCategories = data.categories.map((c) => ({
  ...c,
  count: data.items.filter((i) => i.category === c.id).length,
}));

const nameOf = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));

export const stackItems = data.items.map((i) => ({
  ...i,
  categoryName: nameOf[i.category],
  image: `/stack/${i.id}.webp`,
  domain: new URL(i.url).host.replace(/^www\./, "") + new URL(i.url).pathname.replace(/\/$/, ""),
}));
