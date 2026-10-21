import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import { site } from "./site.js";
import { posts, postBySlug, tags, categories, loadBody, termSlug } from "./content.js";

// renderToString 是同步的，先把所有正文装进缓存
await Promise.all(posts.map((p) => loadBody(p.slug)));

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}

// 所有需要预渲染的路由（与旧站 URL 保持一致）
export function routes() {
  return [
    "/",
    "/archives/",
    "/tags/",
    "/categories/",
    "/about/",
    ...posts.map((p) => `/posts/${p.slug}/`),
    ...tags.map((t) => `/tags/${t.slug}/`),
    ...categories.map((c) => `/categories/${c.slug}/`),
  ];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function head(url) {
  let title = `${site.title} · ${site.motto}`;
  let description = site.description;
  let type = "website";
  const post = url.match(/^\/posts\/([^/]+)\/$/);
  const term = url.match(/^\/(tags|categories)\/([^/]+)\/$/);
  if (post && postBySlug[post[1]]) {
    const p = postBySlug[post[1]];
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
  else if (url === "/404.html") title = `404 · ${site.title}`;
  const canonical = site.url + encodeURI(decodeURI(url));
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ].join("\n    ");
}

export { posts, site };
