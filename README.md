# fancyboi999.github.io

个人博客 <https://fancyboi999.github.io>。Vite + React 19 + Lenis，构建时把每个路由预渲染成静态 HTML，由 GitHub Pages 托管。设计语言见 [DESIGN.md](DESIGN.md)，动效见 [MOTION.md](MOTION.md)。

## 写文章

在 `content/posts/` 新建 `YYYY-MM-DD-<slug>.md`，front matter 支持 `title`、`date`、`description`、`categories`、`tags`。文章 URL 是 `/posts/<slug>/`。静态文件放 `public/`。

## 加工具（/stack/）

在 `content/stack.json` 的 `items` 里加一项（`id`、`name`、`url`、`category`、`note`），再把官网首屏截图存成 `public/stack/<id>.webp`（800×516）。`categories` 决定分组和筛选。

## 命令

```bash
npm install
npm run dev       # 本地开发，http://localhost:5173
npm run build     # content → 客户端构建 → SSR 构建 → 预渲染到 dist/
npm run preview   # 预览 dist/
```

推送到 `main` 后，`.github/workflows/pages-deploy.yml` 构建并部署；PR 只跑构建。

## 结构

- `scripts/content.mjs`：Markdown → `src/generated/`（文章索引与正文 JSON）
- `scripts/prerender.mjs`：渲染全部路由，生成 `404.html`、`feed.xml`、`sitemap.xml`、`robots.txt`
- `src/fx/`：像素天空、滚动舞台、换词标题等特效（从 skill 的 assets 拷入）
- `src/site.js`：站点名称、简介、首页标题文案
- `src/stack.js` + `content/stack.json`：工具箱数据；`src/routes/Stack.jsx` 是画布和分类两种视图
