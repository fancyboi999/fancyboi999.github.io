// 把 content/posts/*.md 编译成前端可用的 JSON：
//   src/generated/posts.json          文章元信息 + 标签/分类索引（首页、归档用，打进主包）
//   src/generated/posts/<slug>.json   单篇正文 HTML + 目录（按需加载）
// URL 规则沿用旧站：/posts/<文件名去掉日期>/、/tags/<小写名>/、/categories/<名>/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "content/posts");
const outDir = path.join(root, "src/generated");
const postOut = path.join(outDir, "posts");

export const termSlug = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "-");
const headingSlug = (s) =>
  s.trim().toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "")
    .replace(/-+/g, "-") || "section";

function renderer(toc) {
  const md = new MarkdownIt({ html: true, linkify: true });
  md.use(anchor, {
    slugify: headingSlug,
    level: [2, 3],
    callback: (token, { slug, title }) => toc.push({ level: Number(token.tag.slice(1)), slug, title }),
  });
  const defaultLink = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
  md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
    const href = tokens[i].attrGet("href") || "";
    if (/^https?:\/\//.test(href)) {
      tokens[i].attrSet("target", "_blank");
      tokens[i].attrSet("rel", "noopener");
    }
    return defaultLink(tokens, i, opts, env, self);
  };
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
  md.renderer.rules.table_close = () => "</table></div>\n";
  return md;
}

// 旧站 Liquid 写法：{{ "/x" | relative_url }} → /x
const stripLiquid = (s) => s.replace(/\{\{\s*["']([^"']+)["']\s*\|\s*relative_url\s*\}\}/g, "$1");

// 中文按字、英文按词估算阅读时长
const readMinutes = (text) => {
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = (text.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
};

export function buildContent() {
  fs.rmSync(postOut, { recursive: true, force: true });
  fs.mkdirSync(postOut, { recursive: true });
  const posts = [];
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith(".md")).sort()) {
    const m = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!m) throw new Error(`文件名需要是 YYYY-MM-DD-slug.md：${file}`);
    const { data, content } = matter(fs.readFileSync(path.join(srcDir, file), "utf8"));
    const slug = m[2];
    const toc = [];
    const html = renderer(toc).render(stripLiquid(content));
    const date = data.date ? new Date(data.date) : new Date(`${m[1]}T00:00:00+08:00`);
    const meta = {
      slug,
      title: data.title,
      date: date.toISOString(),
      description: data.description || "",
      categories: data.categories || [],
      tags: data.tags || [],
      image: data.image || null,
      readMin: readMinutes(content),
    };
    posts.push(meta);
    fs.writeFileSync(path.join(postOut, `${slug}.json`), JSON.stringify({ html, toc }));
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));

  const index = (key) => {
    const map = new Map();
    for (const p of posts) for (const name of p[key]) {
      const slug = termSlug(name);
      if (!map.has(slug)) map.set(slug, { slug, name, posts: [] });
      map.get(slug).posts.push(p.slug);
    }
    return [...map.values()].sort((a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug));
  };
  const out = { posts, tags: index("tags"), categories: index("categories") };
  fs.writeFileSync(path.join(outDir, "posts.json"), JSON.stringify(out, null, 1));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { posts, tags, categories } = buildContent();
  console.log(`content: ${posts.length} posts, ${tags.length} tags, ${categories.length} categories`);
}
