---
version: alpha
name: Fancyboi
description: >-
  fancyboi999.github.io 的设计语言：安静的纸白界面，加上像素天空、斜体衬线和齿孔邮票这几处有性格的元素。
  token 与 src/styles/global.css、src/components/Stamp.jsx 中的值一致，改样式时两边同步。
colors:
  primary: "#000000"
  secondary: "#007AB8"
  ink: "#000000"
  paper: "#F8F8FA"
  surface: "#FFFFFF"
  slate: "#2E3342"
  muted: "#646465"
  subtle: "#9B9B9B"
  line: "#CACACD"
  on-ink: "#FFFFFF"
  sky-deep: "#00AAFF"
  sky-mid: "#77CCFF"
  sky-pale: "#FFFFFF"
  stamp-blue: "#00AAFF"
  stamp-blue-mid: "#99DDFF"
  stamp-orange: "#FF9900"
  stamp-orange-mid: "#FFD699"
  stamp-pink: "#FF3FA4"
  stamp-pink-mid: "#FFB3DB"
  stamp-green: "#2FC47A"
  stamp-green-mid: "#A6E9C6"
  stamp-blue-text: "#007AB8"
  stamp-orange-text: "#A86500"
  stamp-pink-text: "#D13486"
  stamp-green-text: "#208553"
  code-ground: "#0D0F14"
  code-ink: "#E8EAF0"
typography:
  display:
    fontFamily: Instrument Serif
    fontSize: 132px
    fontWeight: 400
    lineHeight: 1.08
  title:
    fontFamily: Geist
    fontSize: 112px
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: -0.03em
  statement:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.02em
  post-title:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.02em
  lead:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
  prose:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.85
  ui:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  tag:
    fontFamily: Newsreader
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  xs: 6px
  sm: 10px
  md: 12px
  lg: 16px
  xl: 28px
  round: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 160px
  page-max: 1264px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.round}"
    height: 44px
    padding: 0 22px
    typography: "{typography.ui}"
  button-primary-hover:
    backgroundColor: "{colors.slate}"
    textColor: "{colors.on-ink}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    height: 44px
    padding: 0 22px
  nav-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    height: 46px
    typography: "{typography.ui}"
  tag-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.slate}"
    rounded: "{rounded.round}"
    padding: 2px 9px
    typography: "{typography.tag}"
  tag-chip-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  stamp:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stamp-blue-text}"
    width: 280px
  stamp-ink:
    backgroundColor: "{colors.stamp-blue}"
  stamp-dither:
    backgroundColor: "{colors.stamp-blue-mid}"
  stamp-orange:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stamp-orange-text}"
  stamp-orange-ink:
    backgroundColor: "{colors.stamp-orange}"
  stamp-orange-dither:
    backgroundColor: "{colors.stamp-orange-mid}"
  stamp-pink:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stamp-pink-text}"
  stamp-pink-ink:
    backgroundColor: "{colors.stamp-pink}"
  stamp-pink-dither:
    backgroundColor: "{colors.stamp-pink-mid}"
  stamp-green:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stamp-green-text}"
  stamp-green-ink:
    backgroundColor: "{colors.stamp-green}"
  stamp-green-dither:
    backgroundColor: "{colors.stamp-green-mid}"
  blue-section:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-ink}"
    typography: "{typography.statement}"
  sky-deep:
    backgroundColor: "{colors.sky-deep}"
  sky-dither:
    backgroundColor: "{colors.sky-mid}"
  sky-clear:
    backgroundColor: "{colors.sky-pale}"
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.prose}"
  post-meta:
    textColor: "{colors.subtle}"
    typography: "{typography.label}"
  quote:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  code-block:
    backgroundColor: "{colors.code-ground}"
    textColor: "{colors.code-ink}"
    rounded: "{rounded.md}"
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
---

## Overview

一个写 AI Agent 工程的中文技术博客。整体是安静的阅读界面：纸白底、纯黑字、一个无衬线字族、1px 半透明描边、大量留白。性格只来自少数几处，并且每屏只出现一处：

1. **像素天空**：首页 Hero、文章头图、蓝色区块的过渡带和换页转场，都是同一套像素抖动天空（2×2 棋盘格过渡相邻色阶）。
2. **斜体衬线**：Hero 标题、Writing 标题、邮票上的短标题、强调词 *Fancy* 和结尾语用 Instrument Serif 斜体；标签用 Newsreader 斜体。正文和界面一律 Geist。
3. **齿孔邮票**：每篇文章是一张略微倾斜的邮票，颜色按编号轮换，悬停时摆正上浮。

读者感受的目标是"安静、好读，偶尔有点好玩"。

## Colors

- **ink `#000` / paper `#F8F8FA` / surface `#FFF`** 构成几乎全部界面。主按钮是黑色胶囊。
- **天蓝 `#00AAFF → #77CCFF → #FFF`** 是唯一的品牌色，只用作像素天空的三档色阶，不用于文字或细线。
- **深蓝 `#007AB8`** 是蓝色区块的底色，白字在上面的对比度是 4.69:1。区块上方的像素过渡带把色阶压一档（`#007AB8 → #00AAFF → #77CCFF`），最深一档与底色衔接。
- **灰阶**：`slate #2E3342` 用于副文和标签，`muted #646465` 用于说明文字，`subtle #9B9B9B` 只用于日期、页码这类元信息，`line #CACACD` 用于分隔线。
- **邮票四色**：蓝、橙、粉、绿。每色三档：深、浅两档印像素画面，签条文字用同色系加深的第三档（`#007AB8`、`#A86500`、`#D13486`、`#208553`，白底对比度都在 4.6:1 以上）。按文章编号 `(no − 1) % 4` 轮换，01 是蓝；编号从最早一篇算起，发新文章不会改变旧文章的颜色。
- **描边**用黑色 4% / 8% / 14% 透明度，写成 `box-shadow: 0 0 0 1px`，分别对应静止、默认和悬停。

## Typography

- **Display**：Instrument Serif 斜体 400，`clamp(44px, 7.4vw + 14px, 132px)`。只用于首页 Hero、Writing、Contact 和 404 标题。没有中文字形，中文回退到宋体。
- **Title**：Geist 500，`clamp(48px, 6.6vw + 4px, 112px)`，字距 −0.03em，用于列表页大标题。
- **Statement**：Geist 500，`clamp(32px, 2.8vw + 18px, 64px)`，用于蓝色区块里的主张。
- **正文**：Geist 17px / 1.85，中文回退 PingFang SC。文章内 h2 28px、h3 21px，均为 500。
- **标签**：Newsreader 斜体 500，15px（标签云 17px）。中文标签不做合成斜体（`font-synthesis-style: none`）。
- **元信息**：Geist Mono 12–13px，日期和数字用 `tabular-nums`。
- 字体全部自托管（fontsource），不依赖 Google Fonts。

## Layout

- 页面边距 `max(clamp(20px, 6.1%, 88px), (100% − 1264px) / 2)`：小屏留 20px，大屏收成 1264px 的内容栏。
- 每个页面是一张整屏卡片，在卡片内部滚动（换页转场依赖这个结构，见 MOTION.md）。
- 首页 Hero 是 2.6 屏高的粘性舞台；Writing 是横向滚动的一排邮票，左边最新；Values 是 12 栏网格，标题占 1–6 栏，正文占 8–12 栏。
- 文章页：左侧 220px 粘性目录，正文最宽 720px；1100px 以下隐藏目录。
- 断点：1100px（目录）、960px（Values 变单栏）、640px（移动端）。

## Elevation & Depth

整体几乎是平的：

- 卡片和代码块用 1px 透明描边，不用边框。
- 主按钮带一层偏蓝的柔和投影 `0 3px 12px rgba(95, 122, 143, 0.25)`。
- 导航是玻璃胶囊：白色 72% + 16px 背景模糊 + 内侧白色高光。
- 邮票用 `drop-shadow`（跟随齿孔轮廓），而不是 `box-shadow`。

## Shapes

- 按钮、导航、标签一律胶囊（999px）。
- 引用、代码块、表格 12px；列表行悬停底 10px；行内代码 6px。
- 邮票：宽 16 个齿距、高 23 个齿距；四周和画面下方各有一排半径 0.38 齿距的圆孔，用 CSS `mask` 打出来。
- 像素图形一律是硬边方块，`image-rendering: pixelated`。

## Components

- **主按钮**：黑色胶囊，高 44px。悬停变 slate 并放大到 1.015，按下缩到 0.97，箭头向右上推一下。旁边可配一个 44px 圆形箭头按钮。
- **导航**：左侧玻璃胶囊放 logo 和三个链接，当前页链接有浅灰底；右侧是 GitHub 胶囊和 RSS 圆按钮。
- **标签**：纸白底胶囊，slate 斜体字，数量用 600 字重。蓝色区块里是白字白描边的半透明版本。
- **邮票**：上方正方形像素画面，下方签条写 `YYYY-MM`、两行英文斜体短标题和两位编号。短标题取 front matter 的 `legend`，没有时由文件名 slug 生成。
- **文章头**：顶部 200px 像素天空逐行显现，下面是标签、标题、导语和元信息。

## Do's and Don'ts

- Do：每屏只留一处有性格的元素，其余保持安静。
- Do：装饰性动效按步数跳变，功能性动效平滑过渡（见 MOTION.md）。
- Do：所有动效尊重 `prefers-reduced-motion`，直接给出最终状态。
- Don't：在亮天蓝 `#00AAFF` 或浅色色阶上放文字；文字放在深蓝 `#007AB8` 或纸白上。
