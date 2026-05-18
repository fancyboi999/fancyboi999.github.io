---
layout: post
title: "Agent 自进化进展盘点：参数没动，凭什么叫'进化'"
author: fancyboi
date: 2026-05-19 00:00:00 +0800
categories: [研究]
tags: [agent, self-evolution, memory, skill-library, reflexion, voyager, claude-code, hermes, gepa, dspy]
description: 从 Reflexion 2023 到 Claude Dream 2026 的完整盘点。区分真正的 self-evolution（model）和被包装成自进化的 context engineering（memory + prompt + skill）。当下大部分产品停在第三层，少数研究在第二层，第一层是闭源大厂的护城河。
---

写这篇之前我先把锋芒亮出来：现在被叫做"self-evolving agent"的东西，绝大多数是**上下文工程换了个时髦名字**。Claude Code 的 Dream、Hermes 的 Curator、Codex 的 cross-chat memory，这些都没碰模型参数。说它们让 agent "自我进化"，技术上不严谨。

但我也不否认这条路线有意义——只是要把它和真正的"参数级学习"分开看。把两件事混着讲，是这个领域当下最大的认知雾霾。这篇文章想做的事，就是把雾霾散开，把当下真正前沿的工作摆清楚。

## 先回应一下最常见的误解

我经常听到这种描述：「Agent 现在有记忆了，能从对话里学到东西，下次就懂得更多——这就是自进化。」

这句话每一个名词都是对的，连起来就是错的。理由：

LLM 的能力住在两个地方——**参数里**（训练时编码进去的，叫 weights）和**上下文里**（推理时塞进去的，叫 context）。前者是"它本来会什么"，后者是"它这次能用到什么"。两者构成了模型实际表现的全部。

传统机器学习改的是参数。"模型从数据里学到东西"指的是反向传播让 weights 数值改变了。学完之后即使你不喂任何提示，模型也变强了。

现在的 Agent memory / skill library / cross-session context——改的全是后者。你给它的"经验"以 markdown / JSON / SQLite / 向量库的形式存起来，下次会话再塞回 system prompt 或者用 RAG 检索召回。**模型本身一动没动**。换一个模型骨架，所有"经验"立刻失效。

所以严格地讲：
- 当下绝大多数产品级 self-evolve = **contextual self-adaptation**（上下文级别的自适应）
- 真正的 self-evolve = **model-level update**（参数级别的更新）

这个区分很关键。下面所有内容都建立在这个区分上。

## 纵向：从 Reflexion 到 Claude Dream，故事是怎么走的

### 2023.03 Reflexion——一切的开始

Noah Shinn 等人在 NeurIPS 2023 发的《Reflexion: Language Agents with Verbal Reinforcement Learning》，是这一整条线的祖师爷论文。

核心思路简单到一句话能说完：**让 agent 在失败之后用自然语言写一段反思，把这段反思塞进下一次尝试的 prompt 里**。不改 weights，没有梯度，没有反向传播。Shinn 把这种"用语言代替梯度"的范式叫 "Verbal Reinforcement Learning"。

数字上看真的能打：HumanEval coding benchmark 上 Reflexion 拿到 91% pass@1，那个时候 GPT-4 自己只有 80%。**用同一个模型，只是加了一层反思循环，能拿到 +11% 的提升。**

后来所有"agent 整理失败经验"、"对话结束后做总结"、"复盘上一段对话"的工作——本质都是 Reflexion 的衍生。你看 Hermes 的 self-evolution loop、Claude Code 的 Dream、Codex 的 memory consolidation，骨架完全一样：**做事 → 反思 → 写入 memory → 下次召回**。三年了，没有人突破这个基本范式。

### 2023.05 Voyager——把"反思"升级成"代码 skill"

NVIDIA 的 Jim Fan 团队发了 Voyager，给 Reflexion 那条路加了一个关键升级——**反思的产物不是文字描述，是可执行代码**。

Voyager 在 Minecraft 里跑，三个组件构成它的循环：
1. **Automatic curriculum**：让 GPT-4 自己提"下一个该学什么任务"
2. **Skill library**：每次任务做成功，把对应的 JavaScript 代码作为一个 skill 存起来，下次同类任务直接 retrieve 重用
3. **Iterative prompting with self-verification**：跑失败时拿环境反馈和报错信息回去改

数据：3.3x 更多独特物品、2.3x 更远移动距离、15.3x 更快解锁科技树里程碑。**完全没改 GPT-4 的参数**。

Voyager 那张图——一个不断膨胀的 skill 库——奠定了之后所有"agent 自动积累技能"工作的视觉范式。SkillWeaver、Alita、Hermes 的 Curator，全部都是 Voyager 的衍生——把"积累 JS 代码"换成"积累 Python API"、"积累 MCP"、"积累 markdown"，骨架完全一样。

### 2023.10 MemGPT——把 OS 的虚拟内存搬到 LLM 上

Berkeley 的 Charles Packer 等人发了 MemGPT，提了一个非常聪明的类比——**LLM 的上下文窗口 = RAM，应该有专门的内存管理器**。

MemGPT 把记忆分成三层：
- **Core Memory**：始终在 context window 里的关键信息，像 RAM
- **Recall Memory**：可检索的对话历史，像磁盘缓存
- **Archival Memory**：冷存储，需要工具调用才能访问，像归档

之后这个团队把研究改成了产品，公司改名 **Letta**。今天你看到的 Mem0、Letta、A-Mem 这些 memory layer 产品，全是 MemGPT 这个 hierarchical memory 思路的工程化。

### 2024 全年：百花齐放，但谁都没跳出 Reflexion + Voyager 的框架

这一年出来的东西是真的多：

- **APE / PromptBreeder / SPO / TextGrad**：自动 prompt 优化方向
- **Mem0 / A-Mem / MemInsight / Memory-R1**：memory 管理细节
- **DSPy**：把 prompt 优化做成模块化框架
- **AgentSquare / EvoAgent / ADAS / AFlow**：用进化算法搜 agent 架构

仔细看一遍这些工作——**没有一个改了模型参数**。全在玩 context evolution。Reflexion 把语言反馈作为"梯度"的思路、Voyager 把 skill 作为可重用单元的思路，在这一年被反复以各种角度细化。

我说这话不是贬低这些工作。Mem0 和 Letta 让"agent 有记忆"这件事工程上可用了；DSPy 把 prompt engineering 工业化了。但从研究范式上看，2024 整年没有跳出 2023 那两篇祖师爷设定的框架。

### 2025.04 ChatGPT 全局 memory——产品端第一次大规模落地

4 月 10 日 OpenAI 给所有 Plus / Pro 用户开了 cross-chat memory：ChatGPT 能引用你所有过往对话的内容。6 月免费用户也开了一部分。

技术上没什么新东西——就是把过去聊过的内容索引起来，每次对话开始时把相关 chunk 塞到 system prompt 的 "Model Set Context" 段。Simon Willison 在 2025 年 5 月那篇 "I really don't like ChatGPT's new memory dossier" 里直接表达过不满——它会基于你完全不希望它参考的过往对话来推测你。

这件事的意义在产品而不在技术：**它证明了 cross-session context 这件事在 mass-market 是可行的**。后面所有 agent 的 memory 设计都要面对一个事实——用户对"AI 记住我什么"这件事的容忍度是有限的，得给细粒度的 forget / disable 选项。

### 2025.04 SkillWeaver——把 Voyager 思路搬到 Web

OSU NLP 组发了 SkillWeaver，做的事是 Voyager 的 Web 版本：让 agent 在浏览器上自动尝试 → 把成功的轨迹蒸馏成可重用的 Python API → 下次同类任务调 API。

数字：WebArena 上相对成功率提升 31.8%，真实网站上 39.8%。还有一个我觉得更有意思的数字——**强 agent 合成的 API 让弱 agent 表现提升 54.3%**。这是 skill transfer 第一次有这么明显的实证。这意味着"积累的 skill 库"可以作为一种独立资产存在，不绑定具体模型。

### 2025.05 Alita——动态 MCP 生成

Tencent 团队发了 Alita：用很少的预设，让 agent 根据任务动态生成 MCP（Model Context Protocol）。GAIA benchmark 上 75.15% pass@1，87.27% pass@3。

这条路有意思的地方是：**它把 MCP 这个原本由开发者定义的协议，变成了 agent 自己写出来的产物**。换句话说，agent 在运行时自己造工具给自己用。这是 Voyager 的代码 skill 思路在 MCP 时代的延续。

### 2025.07 GEPA——这条线上最强的"非新"突破

UC Berkeley 那篇《GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning》，论文标题就给整个领域定了一个反向论断——**用 reflection + 进化搜索，能比强化学习更好地优化文本组件**。

GEPA 的核心算法：
1. 跑一组 prompt 候选
2. 收集每个候选的完整 execution trace（不只是 reward 标量，还包括 error message、reasoning log）
3. 用 LLM **读完整 trace 反思**，提出针对性修改
4. 维护 Pareto frontier 而不是单一最优——保留在不同任务上各擅胜场的候选
5. 下一轮变异从 frontier 采样

数字相当吓人：**比 GRPO 强 6-20%，用 35 倍更少的 rollout**。在 prompt 优化领域比 MIPROv2 强 10% 以上（AIME-2025 上 +12% accuracy）。

为什么这件事重要？因为它戳穿了一个隐含假设——很多人默认"要做 self-improve，必须改参数（RL/SFT）"。GEPA 说不必须。**很多场景下，深度 reflection + 进化搜索 + Pareto 多样性维护，效果就已经超过 RL 了**，而且不用 GPU 训练。

现在 Hermes Agent 的 self-evolution 模块直接接的就是 DSPy + GEPA。这意味着 GEPA 已经从论文成果开始进入产品。

### 2025.07 A Survey of Self-Evolving Agents——第一篇系统综述

厦大等团队的这篇综述（arxiv 2507.21046）值得每个搞这块的工程师读。它给出了第一个完整的分类框架：

| 维度 | 分支 |
|------|------|
| What to evolve | Models（参数）/ Context（memory + prompt）/ Tools / Architecture |
| When to evolve | Intra-test-time（单任务内）/ Inter-test-time（跨任务） |
| How to evolve | Reward-based / Imitation / Population-based (evolutionary) |
| Where to evolve | General / Coding / GUI / Finance / Healthcare / Education |

把这个框架记住，几乎所有 "self-evolve" 论文你都能立刻定位它在哪个格子。下一节横向对比会用到。

### 2025.10-11 Anthropic Claude Code Dream——"梦境"巩固记忆

Anthropic 在 Managed Agents 里安静地上了一个叫 Dream / Auto Dream 的功能，没有大张旗鼓发布。

机制借鉴神经科学——人睡觉时大脑会回放白天的经历、识别 pattern、丢弃噪音、把短期记忆固化为长期记忆。Anthropic 的 Dream 做的是同样的事：定时扫描 agent 过去的 session 和 memory store，抽取 pattern，把有用的部分巩固，把噪音清掉。

我读了不少二手分析，最关键的几条：
- **跨 session 才能看到的 pattern**：单个 session 内 agent 看不到自己反复犯的同类错误
- **同一团队共享 pattern**：多个 agent 共同收敛到的工作流可以被识别和强化
- **24 小时自动触发**：不需要人手动维护

这个功能目前 research preview，得申请。但思路上看，**它就是 Reflexion 的产业级跨 session 包装**——单 session 内的反思（Reflexion 干的）扩展到跨 session 的 pattern consolidation。

### 2025-2026 Hermes Agent——把所有上面提到的工程化打包

Nous Research 的 Hermes Agent 是当下最完整的 self-evolution 工程产品（开源）：

- 任务完成后自动蒸馏 **Skill**（Voyager 思路）
- 后台 **Curator** 7 天周期管理 skill 库——评分、合并、剪枝
- SQLite 存可搜索的 session 历史
- 三层 memory：persistent notes / retrieval / procedural knowledge
- 进阶版 `hermes-agent-self-evolution` 用 **DSPy + GEPA** 进化优化 prompt / skill / code

Hermes 比 Claude Code 更激进的地方是它公开了完整 loop，你能看到每一个环节。Claude Code 的 Dream 是黑盒研究预览，Hermes 是开源工程实现。**这两者的对比构成了"闭源大厂 vs 开源社区"在 self-evolve 这条路上的两种典型形态。**

### 2026 早期：Cursor / Claude Code 内置 memory 进入主流

到 2026 年初这件事在 mass-market 上彻底平民化：

- **Claude Code**：CLAUDE.md（人写）+ Auto Memory（Claude 自己写），4 层目录架构（项目 / 用户 / 组织 / 共享），25KB 索引上限
- **Cursor**：完全不同的路线，用 tree-sitter 把代码 parse 成 AST，靠**索引代码本身**当 memory，不做总结
- **AGENTS.md**：跨工具的开放标准，被 GitHub Copilot、Gemini、Codex 等都支持

NexusTrade 那篇对比文章下了一个我觉得正确的判断：**Cursor 的 memory 路线是"信任代码本身"，Anthropic 的路线是"信任自己维护的笔记"**。前者不解释、只索引，后者解释、写笔记。对软件开发场景，Cursor 这条路是更可信的——代码本身永远是 ground truth，笔记可能 stale。

## 横向：当下生态全景

把上面所有系统按综述给的 What/How 框架重新摆一遍，能看清楚谁在做什么：

### 按"改什么"分类

| 维度 | 代表系统 | 关键约束 |
|------|---------|---------|
| Models（参数级） | SCA、Self-Rewarding、SELF、SCoRe、RLHF 各种 | 训练成本高、可能灾难性遗忘、需要安全验证 |
| Context - Memory | MemGPT/Letta、Mem0、A-Mem、ChatGPT Memory、Claude Dream、Codex Memory | 上下文窗口有限、记忆检索是另一个搜索问题 |
| Context - Prompt | APE、PromptBreeder、DSPy、GEPA、TextGrad | 优化算法本身的成本（rollout、reflection 次数） |
| Tools - Creation | Voyager、CREATOR、Alita、SkillWeaver、Hermes Skills | skill 库的质量保证（GEPA 试图解决） |
| Tools - Management | CRAFT、ToolGen | skill 检索准确性 |
| Architecture | AgentSquare、EvoAgent、AFlow、ADAS | 搜索空间巨大，难以 evaluate |

### 真正改参数的工作（少数派，但才是"真 self-evolve"）

这一类的代表是 **Self-Challenging Agent (SCA)**、**Self-Rewarding Language Models**、**SCoRe**。它们做的事：

1. 让模型自己出题（self-challenge）或自己评分（self-reward）
2. 用模型生成的反馈做 RLHF / DPO，更新参数
3. 循环

这是经典 ML 范式套上了 LLM 自评估。它的优势是模型本体真的变强了，劣势是：

- 训练成本高，单个 iteration 要跑 GPU 集群
- 容易陷入"自我奖励陷阱"——模型学会刷自己的 reward 而不是真的变强
- 灾难性遗忘很难控制
- 没法在用户侧做，只能在厂商侧做

所以你看 OpenAI / Anthropic / Google 三家闭源大厂悄悄在做参数级 self-evolve，但开源生态全在做 context-level。这不是技术能力差别，是**部署边界**——参数级演化必须在训练管线里做，开源用户拿不到训练管线。

### 各家产品的横向比较

| 产品 | 路线 | 长板 | 短板 |
|------|------|------|------|
| ChatGPT Memory | 全局 cross-chat 关键事实 | 用户体验流畅、隐私控制清晰 | 容易 over-personalize、Willison 那种"AI dossier"焦虑 |
| Codex Memory | 借 ChatGPT 全局记忆 | 思考阶段和实现阶段连通 | 跨 ChatGPT-Codex 切换时上下文断裂仍存在 |
| Claude Code CLAUDE.md + Dream | 人写 + Claude 自写 + 跨 session 巩固 | 简单透明，4 层架构清晰 | 25KB 上限，没有 RAG 支撑 |
| Cursor | tree-sitter AST 索引代码 | 不会幻觉、不会 stale | 不做"经验积累"，只有"代码当下状态" |
| Letta / Mem0 | 独立 memory layer 产品 | 跨 agent 框架通用 | 引入新组件，集成成本 |
| Hermes Agent | 完整开源 self-evolve loop + DSPy/GEPA | 透明可改、范式最完整 | 工程复杂、需要会用 DSPy |
| AGENTS.md | 跨工具开放标准 | 跨厂商可移植 | 还是静态文件，谈不上"进化" |

### 真正"新"的工作是哪几个

我自己读完所有这些资料后，觉得真的有新意的工作就这几个：

1. **GEPA (2025.07)**：用 reflection + Pareto frontier 在 prompt 维度打败 RL。这是范式级突破，可能改写未来 2-3 年的 agent 优化路线。
2. **Alita (2025.05) 的动态 MCP 生成**：让 agent 自己写工具协议给自己用，超出了 Voyager 单纯写代码 skill 的范畴。
3. **SkillWeaver 的 cross-agent skill transfer (54.3% 提升)**：第一次实证了 skill 可以独立于 agent 存在，跨实例转移。
4. **Claude Code Dream 的跨 session pattern consolidation**：把 Reflexion 从 episode-level 升到 lifetime-level 的产品级实现。

其他大多数工作要么是工程细节优化，要么是 Reflexion + Voyager 的衍生包装。这不是贬义——工程细节优化和衍生包装本身有产业价值。只是要清楚谁是骨架谁是肉。

## 横纵交汇：几个判断

### 判断 1：「Context 自进化」是当下唯一商业可行的路径，但它有天花板

为什么大家都在做 context evolution 而不是 model evolution？因为后者的成本结构在 mass-market 上不可行。每个用户都让模型 fine-tune 自己的副本，硬件成本爆炸；不让 fine-tune 又起不到效果。

Context evolution 的好处是**纯软件成本**——memory 存到 SQLite、向量库、markdown 文件里，推理时塞进 prompt 就行。每个用户的"经验"互不干扰，隐私边界清晰。

但天花板也清楚——**Context 窗口有限、检索是另一个问题、cross-session 一致性靠工程拼起来**。Anthropic 的 25KB 索引上限就是这个天花板的具体数字。当用户的"经验"超出这个数字，你必须做选择性遗忘——也就是说 agent 必然忘事。

### 判断 2：GEPA 论文是这两年看到最关键的范式转变信号

让我把 GEPA 那篇论文标题再放一遍：

> Reflective Prompt Evolution Can Outperform Reinforcement Learning.

这句话的潜台词非常重——**很多场景下不需要训练 GPU，只用 inference + reflection 就能达到比 RL 更好的效果**。如果这个结论稳得住，未来 2-3 年的 agent 优化基础设施会发生根本性重组：

- 个人开发者也能做 self-evolve（之前要训练管线，现在只要 API）
- 闭源大厂的"训练优势"在 prompt-level 优化上被相对削弱
- DSPy 这类 prompt 框架会变成核心基础设施（Hermes 已经这么做了）

我不敢断言 GEPA 一定就是未来，但它至少证明了——**"必须改参数才能让 agent 变强"是一个被打破的假设**。

### 判断 3：当前所有 self-evolve 产品都解决不了一个核心问题——经验质量参差不齐

这是我自己最近用 Claude Code 和 Codex 的体感。memory 会自动记下来的"经验"质量很不稳定——有些是对的、有用的、能复用的，有些是当时的偶发情况、不应该泛化的、用了反而出错的。

Anthropic Dream 的设计已经显示他们意识到了这点——所以才有"扫 pattern、丢噪音、巩固有用的"。但 **"什么是有用的"这件事本身需要判断力**，目前所有产品的判断都是用 LLM 自己评判 LLM 的 memory——这又回到了我们在测试那篇文章里讨论的 LLM-as-Judge 偏见问题。

Hermes 的 Curator 也好、Claude Dream 也好、ChatGPT 的 memory 也好——本质都是"用模型判断模型产生的经验"。这个回路有内生缺陷：**没有外部 oracle 校准，judge 自己的偏见会被放大成 memory 的偏见**。

所以 self-evolve 的下一个真正的瓶颈，不是"能不能积累经验"，而是"能不能可靠地分辨经验的质量"。这件事目前没人解决。

### 判断 4：中美生态在这条路上的分叉

OpenAI / Anthropic / Google：闭源训练管线 + 产品级 memory（ChatGPT Memory、Claude Dream、Gemini 个性化）。**他们的优势是同时握有"改参数"和"改 context"两条路**。

字节 / 阿里 / 智谱：豆包 / 通义 / 智谱清言。memory 功能都有，但底层模型层面公开的 self-evolve 研究相对少。**FullStack Bench 那种 evaluation 工作做得很扎实，但 self-evolve 这条技术路线的产业投入相对低调**。

开源社区（Hermes、Letta、Mem0、DSPy/GEPA）：填补开源用户拿不到训练管线的空白。**这条路把 self-evolve "民主化"了——不需要 GPU 集群也能做**。Hermes 是当下最完整的代表。

中国厂商在这条线上声音相对小，我猜测原因有二：一是国内 to C agent 产品形态还在探索（豆包 vs ChatGPT 的 memory 体验差距比模型本身的差距大）；二是 GEPA 这类用反思代替训练的范式还没大规模在国内被论证或落地。

### 判断 5：用户预期和实际能力的差距是这条线最大的产品挑战

用户期望中的 self-evolving agent 是这样的：「用得越久越懂我，从我的反馈里学会避免犯过的错，对我的偏好越来越精准。」

当下产品实际能给的是：「在 system prompt 里塞一段从过往对话里抽出来的 markdown，每次推理时模型读一下。」

这两者的差距巨大。前者是参数级的"内化"，后者是上下文级的"参考"。**模型每次推理仍是 stateless 的，它只是有一个不断更新的便签本**。用户感受不到"它真的变懂我了"，因为它确实没有——它只是每次开始前看了一眼便签。

这是当下"AI 有了记忆"宣传话术和实际体验的根本错位。能否突破取决于：要么 context engineering 进化到能让用户感受不出 stateless 的程度（GEPA 这条路）、要么真的做出能在用户侧便宜地 fine-tune 的方案（LoRA 个性化的方向）。

## 第一性原理：到底什么算"学习"

剥到底层，self-evolve 这件事真正问的问题是——**Agent 能不能从经验里变强？**

让我把"变强"这个词拆细：

### 三层"变强"的定义

| 层级 | 含义 | 谁在做 |
|------|------|--------|
| Level 1 - 参数级学习 | 模型本体 weights 改变，离开当前上下文也变强了 | OpenAI/Anthropic/Google 训练管线（不对用户开放） |
| Level 2 - Skill 级学习 | 积累可重用的工具/代码/MCP，下次同类任务直接调 | Voyager、SkillWeaver、Alita、Hermes |
| Level 3 - Memory 级学习 | 积累事实和偏好，下次推理时塞回 context | ChatGPT Memory、Claude Dream、Codex |

用户口中的"agent 自进化"本能上指的是 Level 1——它真的"懂"了。

产品给到的体验绝大多数是 Level 3——它"看了笔记"。

研究前沿在 Level 2 和 Level 3 之间——Skill 是可执行代码，比纯文字 memory 强；但 Skill 库本身也是 context 的一部分，没有改参数。

### 为什么三层差距这么大

成本和安全两个维度的乘积：

```
Level 1 (参数级)：单用户成本爆炸 + 安全风险高（可能学坏）
Level 2 (Skill 级)：单用户成本中等 + 安全风险中（skill 可能错）
Level 3 (Memory 级)：单用户成本低 + 安全风险低（最多召回错）
```

商业落地必须沿着成本递增、风险递增的反方向走，所以产品先做 Level 3，再尝试 Level 2，Level 1 是闭源大厂的护城河。

### "Context 工程即 self-evolve" 是一个有意为之的混淆

我觉得这个混淆不是无意的。当 OpenAI / Anthropic 说"我们的 agent 能学习了"，他们指的是产品形态上看起来像学习，但底层是 memory + RAG。这是营销，不是技术误解。

技术诚实的说法应该是：「我们做了一个 stateful 的 context engineering 系统，让 stateless 的模型表现得像 stateful。」

这不是贬低——这件事本身有巨大产业价值。但把它叫"self-evolution"会让用户的预期错位，最终伤产品口碑。

### 一个反直觉的结论：GEPA 也不是 self-evolve

按上面的严格定义，GEPA 也不改模型参数。它优化的是**程序周围的 prompt 和 code**，模型本体没动。

所以 GEPA 算 Level 2.5——介于 Skill 级和 Memory 级之间。它的意义不在于"让模型变强"，而在于**"让模型表现得像变强"的成本骤降**——以前要 RL 改参数才能达到的效果，现在可以用 reflection + 进化搜索在 prompt 层做到。

这给我一个判断：**未来 2-3 年里，"真正的"参数级 self-evolve 依然是闭源大厂的专利**。开源生态和工程师做出来的所有"agent 自进化"产品，本质都是用 GEPA / DSPy / Reflexion / Voyager 这条 context evolution 路径，把"看起来在进化"这个效果做到极致。

### 给传统软件工程师的一个心智模型

如果你是从传统 backend / frontend 转过来理解这条线，可以用这个类比：

- **Level 1 参数级学习** ≈ 编译期改了二进制
- **Level 2 Skill 级学习** ≈ 运行时加载了新的插件 / 动态库
- **Level 3 Memory 级学习** ≈ 程序读了一份配置文件

按这个类比看，当下大部分"self-evolve"产品停在 "agent 能读自己生成的配置文件"这个层级。这件事工程上也很难、有价值，但它不应该被叫"自我进化"。

我倾向更准确的术语是 **stateful agent** 或者 **agent with persistent context**——既不夸张也不贬低，准确描述它在做什么。

## 关键参考

奠基论文：
- [Reflexion: Language Agents with Verbal Reinforcement Learning — Shinn et al. NeurIPS 2023](https://arxiv.org/abs/2303.11366)
- [Voyager: An Open-Ended Embodied Agent with Large Language Models — Wang et al. NVIDIA 2023](https://arxiv.org/abs/2305.16291)
- [Voyager 官网](https://voyager.minedojo.org/)
- [MemGPT: Towards LLMs as Operating Systems](https://research.memgpt.ai/)

综述与方法：
- [A Survey of Self-Evolving Agents — XMU et al. 2025.07](https://arxiv.org/abs/2507.21046)
- [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning — Berkeley 2025.07](https://arxiv.org/abs/2507.19457)
- [SAGE: Self-evolving Agents with Reflective and Memory-augmented Abilities](https://dl.acm.org/doi/10.1016/j.neucom.2025.130470)
- [Awesome-Self-Evolving-Agents — XMUDeepLIT](https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents)

Skill / Tool 自生成：
- [SkillWeaver: Web Agents can Self-Improve by Discovering and Honing Skills — OSU NLP 2025.04](https://arxiv.org/abs/2504.07079)
- [Alita: Generalist Agent with Maximal Self-Evolution — 2025.05](https://huggingface.co/papers/2505.20286)
- [ALITA-G: Self-Evolving Generative Agent for Agent Generation](https://arxiv.org/pdf/2510.23601)

工业产品：
- [ChatGPT Memory and new controls — OpenAI 2024](https://openai.com/index/memory-and-new-controls-for-chatgpt/)
- [I really don't like ChatGPT's new memory dossier — Simon Willison 2025.05](https://simonwillison.net/2025/May/21/chatgpt-new-memory/)
- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)
- [Anthropic introduces "dreaming" for Claude Managed Agents — VentureBeat](https://venturebeat.com/technology/anthropic-introduces-dreaming-a-system-that-lets-ai-agents-learn-from-their-own-mistakes)
- [Claude Code Dream auto-dream guide](https://claudefa.st/blog/guide/mechanics/auto-dream)
- [Hermes Agent — Nous Research](https://github.com/nousresearch/hermes-agent)
- [Hermes Agent Self-Evolution (DSPy + GEPA)](https://github.com/NousResearch/hermes-agent-self-evolution)

工具与框架：
- [DSPy GEPA Optimizer](https://dspy.ai/api/optimizers/GEPA/overview/)
- [GEPA 主项目](https://github.com/gepa-ai/gepa)
- [Letta (formerly MemGPT)](https://docs.letta.com/concepts/memgpt/)
- [Mem0](https://github.com/mem0ai/mem0)
- [Cursor vs Claude Code Memory Architecture — NexusTrade 2026](https://nexustrade.io/blog/cursor-vs-claude-code-memory-architecture-20260413)
- [AGENTS.md 跨工具标准](https://amitray.com/claude-md-vs-agents-md-memory-md-skills-md-context-md-guide-2026/)

---

写到最后我想再泼一次冷水。如果你看一些公众号或者营销文章在吹"我家 agent 已经能自进化了"，你大概率应该相信他们做的是 Level 3 - Memory 级。这不是骗你，只是术语被滥用了。下次看到"self-evolving"这个词，先问一句：「参数变了吗？」——大概率答案是没有。这时候这套系统也许仍然值得用，但你心里要有数它实际在做什么。
