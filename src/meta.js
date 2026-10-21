// 每个路由的标题与描述：预渲染写进 <head>，客户端换页时同步 document.title
import { site } from "./site.js";
import { postBySlug, tags, categories, termSlug } from "./content.js";

export function pageMeta(url) {
  let title = `${site.title} · ${site.motto}`;
  let description = site.description;
  let type = "website";
  const post = url.match(/^\/posts\/([^/]+)\/$/);
  const term = url.match(/^\/(tags|categories)\/([^/]+)\/$/);
  if (post && postBySlug[decodeURIComponent(post[1])]) {
    const p = postBySlug[decodeURIComponent(post[1])];
    title = `${p.title} · ${site.title}`;
    description = p.description || description;
    type = "article";
  } else if (term) {
    const list = term[1] === "tags" ? tags : categories;
    const t = list.find((x) => x.slug === termSlug(decodeURIComponent(term[2])));
    if (t) title = `${term[1] === "tags" ? "#" : ""}${t.name} · ${site.title}`;
  } else if (url === "/archives/") title = `Archive · ${site.title}`;
  else if (url === "/tags/") title = `Tags · ${site.title}`;
  else if (url === "/categories/") title = `Categories · ${site.title}`;
  else if (url === "/about/") title = `About · ${site.title}`;
  else if (url === "/stack/") {
    title = `Stack · ${site.title}`;
    description = "fancy 的前端工具箱：做 Web 界面时反复用到的库和工具，按用途分类，可拖拽浏览。";
  }
  else if (url === "/404.html") title = `404 · ${site.title}`;
  return { title, description, type };
}
