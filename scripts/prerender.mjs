// 构建最后一步：用 SSR 包把每个路由渲染成静态 HTML，再生成 404、feed.xml、sitemap.xml、robots.txt。
// 输入：dist/index.html（客户端构建的模板）+ dist-ssr/entry-server.js；输出全部写进 dist/。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const { render, head, routes, posts, site } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const page = (url) => template.replace("<!--app-head-->", head(url)).replace("<!--app-html-->", render(url));

const write = (rel, content) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const urls = routes();
for (const url of urls) write(path.join(url, "index.html"), page(url));
write("404.html", page("/404.html"));

const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (url) => site.url + encodeURI(url);
const body = (slug) => JSON.parse(fs.readFileSync(path.join(root, "src/generated/posts", `${slug}.json`), "utf8")).html;

const updated = posts[0]?.date ?? new Date(0).toISOString();
write(
  "feed.xml",
  `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xml(site.title)}</title>
  <subtitle>${xml(site.description)}</subtitle>
  <link href="${site.url}/feed.xml" rel="self" type="application/atom+xml" />
  <link href="${site.url}/" rel="alternate" type="text/html" />
  <id>${site.url}/</id>
  <updated>${updated}</updated>
  <author><name>${xml(site.author)}</name></author>
${posts
  .map(
    (p) => `  <entry>
    <title>${xml(p.title)}</title>
    <link href="${abs(`/posts/${p.slug}/`)}" rel="alternate" type="text/html" />
    <id>${abs(`/posts/${p.slug}/`)}</id>
    <published>${p.date}</published>
    <updated>${p.date}</updated>
${p.tags.map((t) => `    <category term="${xml(t)}" />`).join("\n")}
    <summary>${xml(p.description)}</summary>
    <content type="html">${xml(body(p.slug))}</content>
  </entry>`,
  )
  .join("\n")}
</feed>
`,
);

const lastmod = Object.fromEntries(posts.map((p) => [`/posts/${p.slug}/`, p.date]));
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${xml(abs(u))}</loc>${lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`,
);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: ${urls.length} pages + 404, feed.xml (${posts.length} entries), sitemap.xml`);
