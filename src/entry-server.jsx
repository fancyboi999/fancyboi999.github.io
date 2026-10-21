import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import { site } from "./site.js";
import { posts, tags, categories, loadBody } from "./content.js";
import { pageMeta } from "./meta.js";

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
    "/stack/",
    ...posts.map((p) => `/posts/${p.slug}/`),
    ...tags.map((t) => `/tags/${t.slug}/`),
    ...categories.map((c) => `/categories/${c.slug}/`),
  ];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function head(url) {
  const { title, description, type } = pageMeta(url);
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
