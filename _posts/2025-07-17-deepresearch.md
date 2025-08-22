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

![deepresearchsurvey]({{ "/assets/img/deepresearchsurvey.png" | relative_url }})


## 项目

| Category      | Subcategory                  | Name                                                | URL                                                                                         |
|:--------------|:-----------------------------|:----------------------------------------------------|:--------------------------------------------------------------------------------------------|
| Open-source   | Agent Framework              | XAgent                                              | https://github.com/OpenBMB/XAgent                                                           |
| Open-source   | Agent Framework              | AutoGen                                             | https://github.com/microsoft/autogen                                                        |
| Open-source   | Agent Framework              | Qwen-Agent                                          | https://github.com/QwenLM/Qwen-Agent                                                        |
| Open-source   | Agent Framework              | OpenAI Agents SDK                                   | https://github.com/openai/openai-agents-python                                              |
| Open-source   | Agent Framework              | N8n                                                 | https://github.com/n8n-io/n8n                                                               |
| Open-source   | Agent Framework              | AutoChain                                           | https://github.com/Forethought-Technologies/AutoChain                                       |
| Open-source   | Agent Framework              | AgentGPT                                            | https://github.com/reworkd/AgentGPT                                                         |
| Open-source   | Agent Framework              | Open-operator                                       | https://github.com/browserbase/open-operator                                                |
| Open-source   | Agent Framework              | BabyAGI                                             | https://github.com/yoheinakajima/babyagi                                                    |
| Open-source   | Agent Framework              | AutoGPT                                             | https://github.com/Significant-Gravitas/AutoGPT                                             |
| Open-source   | Agent Framework              | MetaGPT                                             | https://github.com/geekan/MetaGPT                                                           |
| Open-source   | Agent Framework              | Llama_index                                         | https://github.com/run-llama/llama_index                                                    |
| Open-source   | Agent Framework              | LangGraph                                           | https://github.com/langchain-ai/langgraph                                                   |
| Open-source   | Agent Framework              | GoogleADK                                           | https://google.github.io/adk-docs/                                                          |
| Open-source   | Agent Framework              | CrewAI                                              | https://github.com/crewAIInc/crewAI                                                         |
| Open-source   | Agent Framework              | Agno                                                | https://github.com/agno-agi/agno                                                            |
| Open-source   | Agent Framework              | Temporal                                            | https://github.com/temporalio/temporal                                                      |
| Open-source   | Agent Framework              | Orkes                                               | https://orkes.io/use-cases/agentic-workflows                                                |
| Open-source   | Agent Framework              | Pydantic-AI                                         | https://github.com/pydantic/pydantic-ai                                                     |
| Open-source   | Agent Framework              | Letta                                               | https://github.com/letta-ai/letta                                                           |
| Open-source   | Agent Framework              | Mastra                                              | https://github.com/mastra-ai/mastra                                                         |
| Open-source   | Agent Framework              | Semantic Kernel                                     | https://github.com/microsoft/semantic-kernel                                                |
| Open-source | Agent Orchestration Platform | Dify                                                | https://github.com/langgenius/dify                                                                            |
| Closed-source | Agent Orchestration Platform | Coze Space                                          | https://www.coze.cn/space-preview                                                           |
| Closed-source | Agent Orchestration Platform | Flowise                                             | https://flowiseai.com/                                                                      |
| Closed-source | ​AI Assistant Tools​           | NotebookLm                                          | https://notebooklm.google/                                                                  |
| Closed-source | ​AI Assistant Tools​           | MGX.dev                                             | https://mgx.dev                                                                             |
| Closed-source | ​AI Assistant Tools​           | You                                                 | https://you.com/about                                                                       |
| Closed-source | ​AI Assistant Tools​           | Microsoft Copilot                                   | https://www.microsoft.com/en-us/microsoft-copilot/organizations                             |
| Closed-source | Workflow​                     | Claude Research                                     | https://www.anthropic.com/news/research                                                     |
| Open-source   | Workflow​                     | Google-gemini/gemini-fullstack-langgraph-quickstart | https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart                      |
| Open-source   | Workflow​                     | Dzhng/deep-research                                 | https://github.com/dzhng/deep-research                                                      |
| Open-source   | Workflow​                     | Jina-AI/node-DeepResearch                           | https://github.com/jina-ai/node-DeepResearch                                                |
| Open-source   | Workflow​                     | LangChain-AI/open_deep_research                     | https://github.com/langchain-ai/open_deep_research                                          |
| Open-source   | Workflow​                     | TheBlewish/Automated-AI-Web-Researcher-Ollama       | https://github.com/TheBlewish/Automated-AI-Web-Researcher-Ollama                            |
| Open-source   | Workflow​                     | Btahir/open_deep_research                           | https://github.com/btahir/open-deep-research                                                |
| Open-source   | Workflow​                     | Nickscamara/open-deep-research                      | https://github.com/nickscamara/open-deep-research                                           |
| Open-source   | Workflow​                     | Mshumer/OpenDeepResearcher                          | https://github.com/mshumer/OpenDeepResearcher                                               |
| Open-source   | Workflow​                     | Grapeot/deep_research_agent                         | https://github.com/grapeot/deep_research_agent                                              |
| Open-source   | Workflow​                     | Smolagents/open_deep_research                       | https://github.com/huggingface/smolagents/tree/main/examples/open_deep_research             |
| Open-source   | Workflow​                     | Assafelovic/GPT-Researcher                          | https://github.com/assafelovic/gpt-researcher/                                              |
| Open-source   | Workflow​                     | HKUDS/Auto-Deep-Research                            | https://github.com/HKUDS/Auto-Deep-Research                                                 |
| Open-source   | Workflow​                     | AgentLaboratory                                     | https://github.com/SamuelSchmidgall/AgentLaboratory                                         |
| Closed-source | Multi-modal Agent UI​         | Manus                                               | https://manus.im/                                                                           |
| Closed-source | Multi-modal Agent UI​         | Flowith-Oracle Mode                                 | https://flowith.net/                                                                        |
| Open-source   | Multi-modal Agent UI​         | OpenManus                                           | https://github.com/FoundationAgents/OpenManus
)                                                   |
| Open-source   | Multi-modal Agent UI​         | Camel-AI/OWL                                        | https://github.com/camel-ai/owl                                                             |
| Open-source   | Multi-modal Agent UI​         | TARS                                                | https://github.com/bytedance/UI-TARS-desktop                                                |
| Open-source   | Multi-modal Agent UI​         | Nanobrowser                                         | https://github.com/nanobrowser/nanobrowser                                                  |
| Open-source   | Multi-modal Agent UI​         | JARVIS                                              | https://github.com/microsoft/JARVIS                                                         |
| Closed-source | Multi-modal Agent UI​         | Devin                                               | https://devin.ai/                                                                           |
| Closed-source | Foundation Models​            | OpenAI Deep Research                                | https://openai.com/index/introducing-deep-research/                                         |
| Closed-source | Foundation Models​            | Gimini Deep Research                                | https://blog.google/products/gemini/google-gemini-deep-research/                            |
| Closed-source | Foundation Models​            | Perplexity Deep Research                            | https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research                     |
| Closed-source | Foundation Models​            | Grok 3 Beta                                         | https://x.ai/news/grok-3                                                                    |
| Closed-source | Foundation Models​            | AutoGLM-Research                                    | https://autoglm-research.zhipuai.cn/                                                        |
| Closed-source | Foundation Models​            | DeepSeek-R1                                         | https://arxiv.org/abs/2501.12948                                                            |
| Closed-source | Developer Tools​              | Vercel                                              | https://vercel.com/                                                                         |
| Closed-source | Developer Tools​              | Bolt                                                | https://bolt.new/                                                                           |
| Closed-source | Developer Tools​              | Cursor                                              | https://www.cursor.com/                                                                     |
| Closed-source | Developer Tools​              | Github Copilot                                      | https://github.com/features/copilot?ref=nav.poetries.top                                    |
| Open-source   | Developer Tools​              | Cline                                               | https://github.com/cline/cline                                                              |
| Open-source   | Developer Tools​              | GPT-pilot                                           | https://github.com/Pythagora-io/gpt-pilot                                                   |
| Open-source   | Developer Tools​              | Restate                                             | https://restate.dev/                                                                        |
| Open-source   | Developer Tools​              | OpenAI Codex                                        | https://github.com/openai/codex                                                             |
| Closed-source | ​Research/Academic Search     | Elicit                                              | https://elicit.com/?redirected=true                                                         |
| Closed-source | ​Research/Academic Search     | ResearchRabbit                                      | https://www.researchrabbit.ai/                                                              |
| Closed-source | ​Research/Academic Search     | STORM                                               | https://storm.genie.stanford.edu/                                                           |
| Closed-source | ​Research/Academic Search     | Consensus                                           | https://consensus.app/                                                                      |
| Closed-source | ​Research/Academic Search     | Scite                                               | https://scite.ai/                                                                           |
| Closed-source | ​Research/Academic Search     | Scispace                                            | https://scispace.com/                                                                       |
| Closed-source | ​Research/Academic Search     | FutureHouse Platform                                | https://www.futurehouse.org/research-announcements/launching-futurehouse-platform-ai-agents |
| Open-source   | ​Research/Academic Search     | PaperQA                                             | https://github.com/Future-House/paper-qa                                                    |
| Open-source   | ​Research/Academic Search     | HKUDS/AI-Researcher                                 | https://github.com/HKUDS/AI-Researcher                                                      |
| Open-source   | Model Training Frameworks​    | Agent-RL/ReSearch                                   | https://github.com/Agent-RL/ReSearch                                                        |
| Open-source   | Model Training Frameworks​    | DSPy                                                | https://github.com/stanfordnlp/dspy                                                         |
| Open-source   | Model Training Frameworks​    | Gair-NLP/DeepResearcher                             | https://github.com/GAIR-NLP/DeepResearcher                                                  |
| Open-source   | Model Training Frameworks​    | ModelTC/lightllm                                    | https://github.com/ModelTC/lightllm                                                         |
| Open-source   | Other LLM Tools​              | Ollama                                              | https://github.com/ollama/ollama                                                            |
| Open-source   | Other LLM Tools​              | Vllm                                                | https://github.com/vllm-project/vllm                                                        |
| Open-source   | Other LLM Tools​              | Web-LLM                                             | https://github.com/mlc-ai/web-llm                                                           |



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


Resources:

[https://github.com/scienceaix/deepresearch](https://github.com/scienceaix/deepresearch)
[A Comprehensive Survey of Deep Research: Systems, Methodologies, and Applications](https://arxiv.org/pdf/2506.12594)