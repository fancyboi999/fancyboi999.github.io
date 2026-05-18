---
layout: post
title: "测试都分什么？从 Myers 1979 到 vibe coding 的完整地图"
author: fancyboi
date: 2026-05-18 00:00:00 +0800
categories: [研究]
tags: [testing, tdd, mutation-testing, property-based-testing, ai-coding, formal-verification]
description: 一次横纵分析法的深度调研。回答两个常被混在一起的问题：测试到底分多少种？有没有一种测试能让我"百分百符合需求"、改了不破坏老逻辑？
---

最近这阵子，我越来越觉得 AI 写代码之后，测试这件事的位置不一样了。

以前测试是"我自己写的代码、自己再写一套测试盯着自己"，本质是和自己较劲。现在更多时候，是 Claude 或者 Cursor 给我吐了一段我没完全读懂的代码，我得想办法证明它没把别的地方弄坏。这两件事的心智模型其实差很多。

正好被一句话戳到——"难道就没有什么测试可以确定修改之后程序百分百符合需求？并且如果是 bug 修复或者在现有基础上修改，不会影响原有逻辑？"

我自己以前对测试的认识，也就是单元测试、冒烟测试、端到端测试这点东西。所以这次干脆把测试体系完整刨一遍，从 1979 年的 Myers 一直翻到 2026 年的 vibe coding。下面是横纵分析法的结果。

先把结论直接拍在这里：**没有任何一种测试可以保证「百分百符合需求」**。这件事在数学层面已经被证明不可能（Rice 定理），不是工程努力的问题。能做的只是组合不同的测试方法，把「未被发现的错误」的概率压到业务能接受的水位上。如果你接受这个前提，后面会好读很多。

## 纵向：测试是怎么走到今天这一步的

### 1957 年之前：测试就是 debug

最早的程序员根本没"测试"这个独立概念。代码跑通了算对，跑不通就改，测试和调试是一回事。直到 1957 年 Charles Baker 才第一次区分 "program checkout"（让程序能跑）和 "program testing"（验证程序解决了正确问题）。

### 1979：Myers 把整个行业的脑子翻过来

Glenford Myers 出了《The Art of Software Testing》，丢出一句颠覆性的话：

> A test that reveals a previously undiscovered error is a successful test.

在这之前业界默认「测试通过 = 软件没问题」。Myers 反过来说，好测试是用来弄坏软件、找出错误的，全绿通过反而是测试的失败——因为这说明你的测试套件根本没本事抓真实存在的 bug。

负向测试、边界值分析、等价类划分这些今天还在用的东西，都是这个时期长出来的。从 1979 到 1982 年那几年，业界第一次把"测试员"当成"想办法弄坏软件的人"，而不是"按 case 跑一遍的人"。

### 1990：Beizer 的四阶段心智成熟度

Boris Beizer 在 1990 年总结了一个挺扎心的框架，把测试者的心智状态分成四级：

1. 让软件能跑
2. 想办法弄坏它
3. 降低风险
4. 把可测试性当成一种生命周期思维

我观察身边的团队，绝大多数卡在 1 和 2 之间，少数到了 3，到 4 的几乎没有。这就是为什么大家直觉上都觉得"测试很重要"，但工程层面普遍做不好——大部分人对测试的认知就停在 Phase 1。

### 1999–2002：TDD 和 Kent Beck

Kent Beck 在写 SUnit 的过程里提炼出"先写测试再写代码"这个反直觉的流程，写进了 Extreme Programming 和后来的 TDD 那本书。

TDD 容易被误解成"多写测试"。它的本质不是这个。**TDD 是一个设计工具**——用测试逼自己先想清楚接口，再想实现。测试只是副产物。这也是为什么有些团队 TDD 落不了地：他们以为是在学测试，其实学的是设计。

### 2004：Michael Feathers 给遗留代码定了义

Feathers 那本《Working Effectively with Legacy Code》给"legacy code"重新下了定义：**没有测试的代码就是 legacy code，不管它多新、多漂亮**。

这本书里他提出了一个我后来用过无数次的方法——**Characterization Test**（特征化测试，又叫 Golden Master）。原文这句话特别重要：

> Characterization tests do not verify the correct behavior of the code, which can be impossible to determine. Instead they verify the behavior that was observed when they were written.

翻译成人话：你不知道这堆烂代码"应该"输出什么，但你能观察到它"实际"输出什么。把这些观察记下来固化成测试，就建立了一张安全网。以后任何改动，只要 golden master 输出变了，立刻报警。

这套思路在 PDF 渲染、报表生成、机器学习模型输出这种"输出复杂到没法逐字段写 assertion"的场景，是唯一可行的策略。ApprovalTests 工具链就是把这件事工程化。

### 2009：Mike Cohn 的测试金字塔

Cohn 在《Succeeding with Agile》里正式提出测试金字塔，比例 70/20/10。底层逻辑是**反馈速度 × 维护成本 × 信心度**这三者的平衡：单元测试毫秒级反馈、几乎零维护，但只能证明"零件是好的"；E2E 测试分钟级反馈、维护噩梦，但能证明"用户真的能用"。

这个模型统治了将近 15 年。但它的前提是 2009 年的世界：单体应用、桌面/Web 形态稳定、前端复杂度有限。世界变了之后，金字塔就开始松动。

### 2018：Kent C. Dodds 把金字塔翻过来

Testing Library 作者 Kent C. Dodds 提出了**测试奖杯**：底座变成 Static（TypeScript + ESLint），主力变成 integration。他的核心论断：

> The more your tests resemble the way your software is used, the more confidence they can give you.

我特别赞同他对单元测试的批评。现代前端组件的 unit test 经常退化成"测实现细节"——你重命名一个内部变量、调整一下 React state 写法，单元测试就一片红，但用户体验完全没变。这种测试不是在保护你，是在拖累你。

这里还有个被很多人忽略的认知升级：**TypeScript 本质上就是一个永远在跑、覆盖率 100%、零维护成本的测试套件**。你定义了 `function foo(x: number)`，编译器就替你跑了"所有非 number 输入都应该报错"这个测试。Dodds 第一次把这件事正式画进了金字塔/奖杯里。

### 2018：Spotify 的测试蜂巢

几乎同时，Spotify 工程团队提出了**测试蜂巢**，专门针对微服务：主力是 integration，少量 implementation detail test，几乎没有 integrated test。

逻辑也很直接：一个微服务自身代码量很小，复杂度全在"和别的服务怎么交互"上。这种情况下死磕单元测试是抓小放大，应该把火力集中在 integration 上，用真实输入真实输出而不是 mock。

### 2010–2022：契约测试、混沌工程、属性测试进主流

这几个看起来无关的东西，其实回应的是同一件事：**分布式系统让"改了不影响老逻辑"变得无比困难**。

- **Pact (2013)**：消费者驱动契约测试。下游消费者写一份"我期望你的 API 长这样"的契约，上游 provider 在每次 CI 里 replay。任意 consumer 期望的字段被你删了或者类型改了，构建立刻红。
- **Netflix Chaos Monkey (2011)** → Simian Army：直接在生产里随机干掉节点、注入网络延迟、整片机房断电（Chaos Gorilla / Kong），逼系统证明自己的韧性是真的。
- **QuickCheck (1999, Haskell) → Hypothesis (2013, Python)**：属性测试。不写"foo(2,3) 应该等于 5"，而是写"对任意 a, b: foo(a, b) == foo(b, a)"，框架自动生成成千上万的输入找反例。2025 年 OOPSLA 一篇实证论文发现，在 Python 项目里 property-based test 平均比手写 unit test 更容易杀死 mutation。

### 2022 到现在：LLM 把测试推到了风口

ChatGPT 之后这三年，整个行业第一次面对一个事实：**代码生成成本接近零，但代码质量的方差被极度放大**。

Veracode 2025 GenAI Code Security Report 跑了 100 多个 LLM、80 个真实编程任务，得出 45% 的生成代码引入了安全漏洞。USENIX 一份联合研究测了 16 个代码生成模型、57.6 万个样本，19.7% 的推荐包是幻觉包（根本不存在），其中 58% 的幻觉包名在多次查询中重复出现——意味着攻击者可以抢注这些幻觉包名做供应链投毒。

更具体的是 Stanford 那个早期研究：**用 AI 助手的开发者比不用的开发者多 41% 引入安全漏洞，前提是他们信任 AI 生成代码而没做结构化验证**。

测试的位置因此变了。它不再是"防止我自己写错"的安全网，而是"防止我没看懂的 AI 生成代码混进去"的过滤网。性质变了，方法论也得跟着变。

## 横向：测试方法的当下切面

我不按"形状"分，按"它能回答你什么问题"分。这才是真正有用的视角。

### 问题一：这段代码本身正确吗

| 方法 | 给你什么 | 致命短板 | 适合场景 |
|------|---------|---------|---------|
| Unit Test | 单个函数/类的逻辑正确 | 测的是实现细节，重构容易失效 | 纯函数、算法、领域逻辑 |
| Property-Based Test | 用上千个随机输入找反例，自动 shrink 到最小复现 | 学习曲线陡，property 本身难写 | 序列化、数学算法、状态机 |
| Mutation Testing | 评估你的测试套件够不够狠 | 极慢，CI 跑不动 | 关键模块的测试质量审计 |
| Fuzz Testing | 用恶意/畸形输入找崩溃和漏洞 | 需要 harness 和 sanitizer | C/C++、解析器、API 边界 |

我自己写代码的体感是：unit test 给你信心，但属性测试加变异测试给你的是**对信心的信心**。Hypothesis 的文档里有句话我特别认：很多 bug 不是因为你写错了某个 case，而是因为你根本没想到那个 case 存在。属性测试就是用来对付"你不知道你不知道"的。

### 问题二：这些代码组合起来还正确吗

集成测试、契约测试、E2E、冒烟、视觉回归。这一类里我想专门聊聊**契约测试**，因为它是用户问的"修改不影响原有逻辑"在微服务场景下的最佳答案。

传统做法是写 E2E 覆盖 A→B→C 的调用链，但 E2E 慢且脆。Pact 的思路反过来：B 服务的消费者 A 写一个 mock，"当我调你 GET /users，我期望拿到这个 shape 的数据"，这个期望被序列化成 contract 文件交给 B。B 在自己的 CI 里 replay 这个 contract——任意 consumer 期望的字段被你删了或者类型改了，B 的构建立刻红。

它把"你改了 API 几天后才发现下游挂了"这种最坑爹的微服务事故，压到了 PR 阶段就拦截。这件事的价值不是技术意义上的，是组织意义上的——它让上下游团队的预期变成了机器可验证的契约，不需要靠开会、Wiki 或者 IM 群同步。

### 问题三：这堆遗留代码我能不能动

这是用户最痛的点之一。

手里有测试、能用 regression suite 跑一遍的算幸运儿。真正难的是那种"没人懂这堆代码到底应该输出什么"的情况——这时候 Feathers 的 characterization test 就是救命的。

具体怎么用：先观察当前代码对一组典型输入的输出，把"现状"原封不动固化成测试。然后再开始改代码。只要你的改动让任何一条 golden master 输出变了，CI 就红。**这里的精髓在于：在你完全不懂遗留代码业务含义的时候，"保持现有行为不变"本身就是一个可执行的需求**。你不需要知道 `calculateTax(order)` 为什么对某个奇怪 case 返回 -1，你只需要知道改完之后它还得返回 -1。

这套方法处理遗留系统、处理 AI 生成的"我也不完全看懂的代码"、处理机器学习模型回归，是通用的兜底策略。我自己在几个老 Java 项目里用过几次，比想象的好用。

### 问题四：线上崩了会怎样

Load test、Stress test、Chaos Engineering、Canary、Feature Flag、Synthetic Monitoring。

Feature Flag 和 Canary 严格说不算测试，但它们是测试体系的最后一道防线，也是最重要的一道。LaunchDarkly 这类平台把"部署"和"发布"解耦：代码部署到生产但功能默认关闭，对 5% 用户开放观察指标，没问题扩到 25%、50%、100%。Gartner DevOps 调研说这套实践把部署风险降低了 70%。

为什么我把它当测试？因为它承认了一个残酷事实：**所有测试都有遗漏，最终极的测试只能在真实生产流量上做**——但你可以把爆炸半径控制到极小。这是 Beizer "Phase 3 降低风险"的工业级实现。

### 问题五：这东西在数学上一定是对的吗

形式化验证。这是离用户"百分百符合需求"诉求最近的方法，但代价极大。

- **TLA+**：Leslie Lamport 创造的规约语言，AWS 用它建模 DynamoDB、S3、EBS 等核心服务，找出过传统测试根本不可能发现的分布式 corner case（比如 8 步并发交错才能触发的不一致）。
- **Coq / Lean / Isabelle**：交互式证明助手。CompCert（经过 Coq 证明的 C 编译器，研究证明它的代码生成层从未被发现过 bug，对比 GCC/LLVM 被 Csmith 模糊测试找出几百个）、seL4 微内核（经过 Isabelle 全代码功能正确性证明，约 9 千行 C 代码，投入了约 20 人年的证明工作）。

代价摆在这里你就懂为什么用的人少了：AWS TLA+ 模型每个核心服务的规约都要几周到几月。TLA+ 的语法对普通工程师"alien"，2025 年了"very few people actually use TLAPS"还是常态。

所以形式化验证的现实定位是：**当 bug 的代价远超验证的代价时才用**。飞控、医疗设备、加密协议、核心分布式协调。普通 CRUD 用它就是杀鸡用核武。

### 那"百分百符合需求"到底能不能做到

回到用户的原问题。把上面所有方法摆在一起看，答案是这样的：

| 你的诉求 | 现实答案 |
|---------|---------|
| 百分百符合需求 | 数学上不可能。Rice 定理证明了对图灵完备程序的"任何非平凡语义性质"是不可判定的。 |
| 实践中尽可能接近 | 形式化验证 + 高质量 property test + mutation testing + 真实生产 canary。代价：人力 ×10。 |
| 正常工程预算下做到 90%+ | 测试金字塔/奖杯/蜂巢择一 + contract test + 完善 CI/CD + feature flag。这是大部分团队的最优解。 |

更关键的是：**「需求」本身经常是不清楚的**。BDD 和 ATDD 想解决的就是这个——逼业务方、产品、开发在动手前用 Gherkin 这种半形式化语言把"系统应该怎么表现"写下来。但实战里 Gherkin 容易退化成伪自然语言：既不像代码那么精确，又不像自然语言那么好读，最后变成开发的额外负担。

所以"百分百符合需求"这件事的真相是：它在数学层面不可达，在工程层面取决于你愿意付多少代价，在沟通层面取决于业务方愿意花多少时间把"需求"讲清楚。三层任意一层崩了，整件事就崩。

### 顺便说一下覆盖率

Martin Fowler 那篇 bliki 文章已经成经典，核心论点：

> If you make a certain level of coverage a target, people will try to attain it. The trouble is that high coverage numbers are too easy to reach with low quality testing.

具体怎么"低质量地达到 100% 覆盖"：
- Assertion-free test：写了 `foo()` 调用但不写 `expect(...)`，覆盖率工具看到这行执行了就算覆盖
- Happy path only：所有分支语法上跑过，但只测了"正常"那一支
- Mock 满天飞：所有外部依赖 mock 掉，覆盖率上去了但你测的根本不是真实行为

Fowler 给的健康指标：用心写测试自然到 80–90%，看到 100% 反而该警惕。

正确的用法是把覆盖率当**探测器**而不是目标。突然从 85% 掉到 70% 说明你新增的代码没测；某个文件长期 30% 说明这块是个雷区。至于该不该追到 95%，问 mutation testing——PIT 或 Stryker 跑一遍，存活的 mutant 多说明你的测试假覆盖率高、真探测力低。

## AI 时代测试范式的重塑

把纵向和横向交起来看，能得到一些前两节单独看不到的判断。这部分是我自己最关心的。

### 测试金字塔从来不是教条，是经济学

为什么金字塔的形状一直在变？因为底层经济参数变了。

2009 年的世界里桌面 Web 单体当道，浏览器自动化贵且脆，所以经典金字塔成立。2018 年前端复杂度爆炸，TypeScript 把 static 变成了"免费测试"，Cypress 把 integration 成本拉低，于是奖杯起来了。同期微服务铺开，单服务代码少、服务间交互多，于是 Spotify 搞了蜂巢。

到了 AI 时代，参数又变了：**写测试的边际成本被 AI 拉低，但读懂代码并相信它的成本反而上升**。这个不对称会让测试形状再次翻转。Wiremock 那篇 2024 年的文章说得直接——"the testing pyramid is an outdated economic model"。当生成 unit test 几乎免费、但生成 integration test 仍然需要真实依赖时，金字塔底部会被无限拉宽，但那个宽底部的"真实信心增量"是递减的。

我自己最近的感受是：unit test 写得越来越快，但越来越像形式化的"装饰品"，给我真正信心的是 contract test、property test 和 canary。

### AI 写代码暴露了一个被忽视已久的事实

传统工作流是「人写代码 → 人写测试 → 测试验证人是否理解」。这个循环的前提是：写代码的人理解代码。

AI 写代码打破了这个前提。Cursor 那篇 2025 年 11 月发的 difference-in-differences 研究《Speed at the Cost of Quality》得出一个让人不舒服的结论：**用 Cursor 的项目交付速度上升，但代码质量指标显著下降**。

为什么？因为人对 AI 生成代码的理解深度系统性下降。**你没真正理解的代码，你写不出有意义的测试**——你只会写"看起来覆盖到了"的测试。这就是 Stanford 那个 41% 的来源。

这导致的范式变化是：AI 时代的测试不能由写代码的人（AI 或者被 AI 牵着走的人）自己写，必须有独立的验证层。具体形态有几种：

1. 不同 session、不同模型来 review（Aikido、Diffray 这类 AI code review 平台的核心做法）
2. 形式化的输入输出约束（property-based test 不让你只测你想到的 case）
3. 真实生产流量回放（contract test + canary + shadow traffic）
4. 强制人工 approve 关键 diff（把"我看过了"做成 git 工作流硬约束）

### 「改了不影响老逻辑」在 AI 时代变得既容易又危险

容易：AI 可以瞬间为你生成 characterization test、golden master、property test。

危险：AI 也可以瞬间帮你"调整 golden master 让测试通过"。这是最隐蔽的回归。

ploeh blog 那篇 2025 年 11 月的《100% coverage is not that trivial》讲了一个具体场景：开发者让 AI 修一个 bug，AI 改了代码，同时"贴心地"改了原本通过的测试。CI 全绿，PR 合并，三个月后生产事故。

所以一条新的工程纪律正在浮现：**任何 PR 里如果同时修改了实现和它对应的测试，必须人工 review 测试改动的必要性**。这件事我自己在 Code Review 里现在会专门看，有时候 AI 改测试改得比改实现还流畅，但你回头一想，这测试不就是来抓你这个改动的吗，怎么能让它自己改自己呢。

## 第一性原理：测试本质上在解决什么

剥到最底层，我觉得测试解决的是一个信息不对称问题——**写代码的人想要的（需求）** 和 **代码实际做的（行为）** 之间的不对称。所有测试方法都可以用这个框架重新解读：

- Unit Test：以"代码作者"视角断言"我以为我写了什么"
- Integration Test：以"模块组装者"视角断言"它们组合起来应该如何"
- E2E / Acceptance Test：以"用户/业务方"视角断言"我看到什么才算对"
- Characterization Test：放弃断言"应该如何"，转而记录"实际如何"——承认有时候业务方自己都说不清需求
- Property Test：用"普适不变式"代替"具体 case"——承认作者列不全所有 case
- Mutation Test：测试"测试本身够不够好"——元层信息对称检查
- Contract Test：在"提供者"和"消费者"之间显式化双方对接口的理解
- Formal Verification：用数学逻辑彻底消除不对称
- Chaos Engineering：承认"我们对生产环境的理解一定是错的"，主动去发现错的部分

不管方法怎么演化，绕不开三个底层约束。第一个是**可观察性**：你只能测你能观察到的东西，一个函数有 IO 副作用但你 mock 掉了，你就观察不到它对真实世界的影响。第二个是**可重复性**：测试必须能反复跑出同样结果，否则没法判断"挂了"是 bug 还是噪声。Golden Master 在处理时间戳、随机数、并发时最大的工程量就在 normalize 这件事上。第三个是**不可判定性**（Rice 定理）：对任意复杂的程序，你不可能写出另一个程序判断它"语义上是否正确"。这是数学硬约束，无法绕过。

第三条决定了"百分百符合需求"永远是一个不可达的渐近线。所有测试方法的差异，只是它们在这条渐近线上的位置和成本不同。

### 为什么 AI 时代会重塑测试体系

因为它改变了根本的成本结构。

传统时代里写代码成本高、写测试成本中、审代码成本中，最划算的是把投资集中在最便宜、最高 ROI 的 unit test 上。AI 时代里写代码成本极低、写测试成本低、审代码成本高（因为不是你写的，你不真懂），生产事故的成本完全不变。最划算的就变成了"绕开人审局限"的方法：property test、contract test、canary、关键模块的 formal verification。

成本一变，最优策略立刻变。这就是为什么形式化验证、混沌工程、属性测试这些"小众"方法在 2024 年之后开始回潮——它们 40 年前就有了，但 ROI 一直不划算，AI 把审代码成本拉高之后，它们突然变划算了。

### 想给读到这里的人留一句话

**不要追求"确定我的代码是对的"——这是个伪命题。要追求"持续缩小'我不知道我的代码哪里可能错'的范围"——这是个可行的工程问题。**

具体怎么做：业务核心路径用 property test + characterization test + contract test 把"我不知道我不知道"压低；高频变化模块用 mutation test 定期审计你的测试是否还在保护你；分布式协调用 TLA+ 把"并发交错"的未知空间清掉；生产环境用 chaos 加 observability 持续找你以为已知但其实未知的盲区；AI 生成代码假设你没真懂它，用独立测试层做对抗式审查。

这套思路下，**测试不是质量保证（QA: Quality Assurance）的工具，是质量探索（Quality Exploration）的工具**。前者假设质量是状态，后者承认质量是过程。

至于"测试都分什么"这个最初的问题——分多少种其实不重要，重要的是你脑子里有没有"我现在的代码处于哪种风险下、我应该用哪类方法把那块未知压低"这种思考。把这个心智模型建起来，剩下的就只是工具选型。

## 关键参考

历史脉络：[The Art of Software Testing — Myers](https://www.amazon.com/Art-Software-Testing-Glenford-Myers/dp/1118031962) · [A brief history of software testing — Salsa Digital](https://salsa.digital/insights/a-brief-history-of-software-testing)

测试形状：[The Practical Test Pyramid — Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) · [Static vs Unit vs Integration vs E2E — Kent C. Dodds](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests) · [Testing of Microservices — Spotify](https://engineering.atspotify.com/2018/01/testing-of-microservices) · [Pyramid or Crab? — web.dev](https://web.dev/articles/ta-strategies)

进阶方法：[Characterization Test — Wikipedia](https://en.wikipedia.org/wiki/Characterization_test) · [Working Effectively with Legacy Code 要点](https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/) · [Hypothesis JOSS paper](https://joss.theoj.org/papers/10.21105/joss.01891.pdf) · [PIT Mutation Testing](https://pitest.org/) · [Stryker Mutator](https://stryker-mutator.io/) · [libFuzzer — LLVM](https://llvm.org/docs/LibFuzzer.html)

契约 / 灰度 / 韧性：[Pact Docs](https://docs.pact.io/) · [Consumer-Driven Contract Testing — Pactflow](https://pactflow.io/what-is-consumer-driven-contract-testing/) · [Release Management with Feature Flags — LaunchDarkly](https://launchdarkly.com/blog/release-management-flags-best-practices/) · [Chaos Engineering — Wikipedia](https://en.wikipedia.org/wiki/Chaos_engineering) · [How Netflix Uses Fault Injection — Coralogix](https://coralogix.com/blog/how-netflix-uses-fault-injection-to-truly-understand-their-resilience/)

覆盖率 / 形式化：[Test Coverage — Martin Fowler bliki](https://martinfowler.com/bliki/TestCoverage.html) · [100% coverage is not that trivial — ploeh blog](https://blog.ploeh.dk/2025/11/10/100-coverage-is-not-that-trivial/) · [A primer on formal verification and TLA+ — Jack Vanlightly](https://jack-vanlightly.com/blog/2023/10/10/a-primer-on-formal-verification-and-tla)

AI 时代：[A Survey of Bugs in AI-Generated Code — arxiv 2025](https://arxiv.org/html/2512.05239v1) · [Speed at the Cost of Quality — arxiv 2511.04427](https://arxiv.org/html/2511.04427v2) · [Vibe Coding's Security Debt — CSA 2026](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-generated-code-vulnerability-surge-2026/) · [Empirical Evaluation of Property-Based Testing in Python — OOPSLA 2025](https://cseweb.ucsd.edu/~mcoblenz/assets/pdf/OOPSLA_2025_PBT.pdf)
