# fancyboi999.github.io

个人博客 <https://fancyboi999.github.io>。Vite + React 19 + Lenis，构建时把每个路由预渲染成静态 HTML，由 GitHub Pages 托管。设计语言见 [DESIGN.md](DESIGN.md)，动效见 [MOTION.md](MOTION.md)。

## 写文章

在 `content/posts/` 新建 `YYYY-MM-DD-<slug>.md`，front matter 支持 `title`、`date`、`description`、`categories`、`tags`。文章 URL 是 `/posts/<slug>/`。静态文件放 `public/`。

## 加工具（/stack/）

在 `content/stack.json` 的 `items` 里加一项（`id`、`name`、`url`、`category`、`note`），再把官网首屏截图存成 `public/stack/<id>.webp`（800×516）。`categories` 决定分组和筛选。

## 加灵感（/inspiration/）

每条是一种设计模式，在 `content/inspiration.json` 的 `items` 里加一项：

- `id`、`name`（中文名）、`aka`（英文叫法和搜索用词，第一个显示在卡片上）、`date`、`tags`、`summary`（一句话说清是什么）
- `source`：原始设计（`title`、`url`）；截图用 1440×900 视口，缩成 800×500 存为 `public/inspiration/<id>.webp`
- `principle`：为什么成立，从它要解决的问题讲起
- `parts`：拆成几个独立的招（`name`、`how`）；`recipe`：最省事的做法
- `similar`：同类设计（`title`、`url`、`kind` 变体、`note`）；`kits`：能直接用的库或教程（`title`、`url`、`note`）
- `search`：以后找同类时用的关键词
- 允许 iframe 嵌入的链接加 `"embed": true`：原始设计显示可交互的实时页面，同类设计和库的卡片多一个「预览」按钮。加之前先确认对方没有 `X-Frame-Options` 或限制 `frame-ancestors`，并在浏览器里看一眼没有跳出；不能嵌入的保持截图

列表页是 `/inspiration/`，详情页是 `/inspiration/<id>/`，按 `date` 从新到旧排列，`tags` 自动生成筛选。

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
