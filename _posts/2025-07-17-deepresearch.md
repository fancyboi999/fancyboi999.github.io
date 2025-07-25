---
layout: post
title: "Deep Research现有方案技术总结：实现架构、特点对比、现存问题及未来方向"
author: "fancy"
categories: research
tags: [research, deep-research]
image: deepresearch.png
imagecredit: Image from website <a href="https://github.com/SkyworkAI/DeepResearchAgent/blob/main/docs/architecture.png">SkyworkAI Deep Research Agent</a>.
description: A sci-fi microstory about deep research.
---

当前已有许多系统，实际上，在之前的文章《[Deep Research现有方案技术总结：实现架构、特点对比、现存问题及未来方向](https://mp.weixin.qq.com/s/7TqX0zi8aI-jByetRIISJg)》中，介绍了《[A Comprehensive Survey of Deep Research: Systems, Methodologies, and Applications](https://arxiv.org/pdf/2506.12594)》，分析了自2023年以来涌现的80多个商业和非商业实现，包括OpenAI/DeepResearch、Gemini/DeepResearch、Perplexity/DeepResearch 以及众多开源替代方案，如 [dzhng/deepresearch](https://github.com/dzhng/deepresearch)、[HKUDS/Auto-Deep-Research](https://github.com/scienceaix/deepresearch)等开源实现。

![deepresearchsurvey](images/deepresearchsurvey.png)
![deepresearchprojects](images/deepresearchprojects.png)

### 开源项目列表

1.  **Agentic Reasoning**:
    *   **GitHub**: [theworldofagents/Agentic-Reasoning](https://github.com/theworldofagents/Agentic-Reasoning)
    *   **推理方式**: Prompting
2.  **gpt-researcher**:
    *   **GitHub**: [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher)
    *   **模型基座**: OpenAI
    *   **推理方式**: Prompting
3.  **deep-searcher**:
    *   **GitHub**: [zilliztech/deep-searcher](https://github.com/zilliztech/deep-searcher)
    *   **模型基座**: Deepseek, OpenAI, Anthropic, Gemini, Qwen
4.  **Search-R1**:
    *   **GitHub**: [PeterGriffinJin/Search-R1](https://github.com/PeterGriffinJin/Search-R1)
    *   **模型基座**: Qwen2.5-7B-Instruct, Qwen2.5-7B-Base, Qwen-2.5-3B-Instruct, Qwen-2.5-3B-Base
    *   **模型优化**: GRPO, PPO
5.  **ZeroSearch**:
    *   **GitHub**: [Alibaba-NLP/ZeroSearch](https://github.com/Alibaba-NLP/ZeroSearch)
    *   **模型基座**: Qwen2.5-3B-Base, Qwen2.5-7B-Base, Qwen2.5-7B-Instruct, Qwen2.5-3B-Instruct, LLaMA3.2-3B-Instruct, LLaMA3.2-3B-Base
    *   **模型优化**: GRPO, PPO, Reinforce
6.  **Webthinker**:
    *   **GitHub**: [RUC-NLPIR/WebThinker](https://github.com/RUC-NLPIR/WebThinker)
    *   **模型基座**: GPT-o1, GPT-o3, Deepseek-R1, QwQ-32B, Qwen2.5-32B-Instruct
    *   **模型优化**: DPO
7.  **nanoDeepResearch**:
    *   **GitHub**: [liyuan24/nanoDeepResearch](https://github.com/liyuan24/nanoDeepResearch)
    *   **模型基座**: OpenAI, Anthropic
    *   **优化策略**: Prompting
8.  **DeerFlow**:
    *   **GitHub**: [bytedance/deer-flow](https://github.com/bytedance/deer-flow)
    *   **模型基座**: Qwen, OpenAI
    *   **优化策略**: Prompting
9.  **deep-research**:
    *   **GitHub**: [dzhng/deep-research](https://github.com/dzhng/deep-research)
    *   **模型基座**: Deepseek, OpenAI
    *   **优化策略**: Prompting
10. **open-deep-research**:
    *   **GitHub**: [btahir/open-deep-research](https://github.com/btahir/open-deep-research)
    *   **模型基座**: OpenAI, Deepseek, Anthropic, Gemini
    *   **优化策略**: Prompting
11. **DeepResearcher**:
    *   **GitHub**: [GAIR-NLP/DeepResearcher](https://github.com/GAIR-NLP/DeepResearcher)
    *   **模型基座**: Qwen2.5-7B-Instruct
    *   **优化策略**: GRPO
12. **R1-Searcher**:
    *   **GitHub**: [RUCAIBox/R1-Searcher](https://github.com/RUCAIBox/R1-Searcher)
    *   **模型基座**: Qwen2.5-7B-Base, Llama3.1-8B-Instruc
    *   **优化策略**: GRPO, Reinforce++, SFT
13. **ReSearch**:
    *   **GitHub**: [Agent-RL/ReSearch](https://github.com/Agent-RL/ReSearch)
    *   **模型基座**: Qwen2.5-7B-Instruct, Qwen2.5-32B-Instruct
    *   **优化策略**: GRPO
14. **Search-o1**:
    *   **GitHub**: [Agent-RL/ReSearch](https://github.com/Agent-RL/ReSearch)
    *   **模型基座**: QwQ-32B-Preview
    *   **优化策略**: Prompting
15. **r1-reasoning-rag**:
    *   **GitHub**: [deansaco/r1-reasoning-rag](https://github.com/deansaco/r1-reasoning-rag)
    *   **基座**: Deepseek
    *   **推理方式**: Prompting
16. **Open Deep Search**:
    *   **GitHub**: [sentient-agi/OpenDeepSearch](https://github.com/sentient-agi/OpenDeepSearch)
    *   **基座**: Llama3.1-70B, Deepseek-R1
    *   **推理方式**: Prompting
17. **node-DeepResearch**:
    *   **GitHub**: [jina-ai/node-DeepResearch](https://github.com/jina-ai/node-DeepResearch)
    *   **基座**: Gemini, OpenAI
    *   **推理方式**: Prompting
18. **deep-research**:
    *   **GitHub**: [u14app/deep-research](https://github.com/u14app/deep-research)
    *   **基座**: Gemini, OpenAI, Deepseek, Anthropic, Grok
    *   **推理方式**: Prompt
