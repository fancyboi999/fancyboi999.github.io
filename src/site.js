// 站点级常量：改名、改简介、改链接都在这里
export const site = {
  title: "Fancyboi",
  url: "https://fancyboi999.github.io",
  description: "fancy 的个人博客：AI Agent 工程、AI 编程与开源。Building smarter agents, breaking dumb limits.",
  author: "fancy",
  github: "https://github.com/fancyboi999",
  hero: {
    // "/" 分行（宽屏时后两行并排，见 .hero-title）；{agents} 是可点的工具胶囊，候选见 agents
    before: ["Engineer", "who", "/", "builds", "with", "/", "{agents}"],
    // 第一项是静止时的原句，点击胶囊依次换成其余几个；图标来自 @lobehub/icons（MIT）
    agents: [
      { label: "agents", tilt: 8 },
      { label: "Claude", icon: "/agents/claude.svg", tilt: -7 },
      { label: "Codex", icon: "/agents/codex.svg", tilt: 10 },
      { label: "Cursor", icon: "/agents/cursor.svg", tilt: -12 },
      { label: "Grok", icon: "/agents/grok.svg", tilt: 7 },
      { label: "Antigravity", icon: "/agents/antigravity.svg", tilt: -5 },
    ],
    after: ["*Fancy*", "{slot}", "ships", "less,", "but", "better"],
    bio: "我是 fancy，AI Agent 工程师。在开源里造 Agent，也造造 Agent 的工具：画布设计 Agent Loomic、让人和 Agent 在同一个频道里协作的 open-tag，还有中文 Agent 工程课《AI 工程从零开始》。",
  },
  motto: "less, but better",
};
