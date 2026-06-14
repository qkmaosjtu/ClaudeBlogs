# SWE-Explore: Benchmarking How Coding Agents Explore Repositories

## 源信息

- 来源：arXiv
- 原文标题：SWE-Explore: Benchmarking How Coding Agents Explore Repositories
- 原文链接：https://arxiv.org/abs/2606.07297
- Canonical URL：https://arxiv.org/abs/2606.07297
- 发布日期：2026-06-05
- 检测/生成时间：2026-06-13T17:11:25.488Z

## P0/P1/P2 价值判断

- 等级：P0
- 判断依据：这是直接命中仓库理解、代码定位、检索评估的研究信号，且属于 AI4SE / code intelligence 的关键测评基础设施。

## 命中关注领域

- Code Intelligence
- Software Engineering Research
- Evaluation Systems
- AI for Software Engineering

## 整体摘要

SWE-Explore 把 coding agent 的“仓库探索”能力单独拿出来测，而不是继续只看 SWE-bench 那种任务最终是否修好。

论文的关键贡献是把 repository understanding、context retrieval、code localization 和 bug diagnosis 拆成更细的评估对象，并用成功 agent trajectory 蒸馏出 line-level ground truth。

## 技术创新点分析

- 首次把 repository exploration 做成独立 benchmark，而不是藏在端到端修复分数后面。
- 覆盖 848 个 issue、10 种语言、203 个开源仓库，数据规模对横向比较很有价值。
- 用 line-level ground truth 和 context-efficiency 指标衡量检索质量，能更精确地区分现代 agentic explorer 的能力差异。

## 企业场景可参考分析

- 适合内部用来设计“代码理解先于代码修改”的 agent 评估基线。
- 适合平台团队验证不同检索策略、代码图、symbol search 和 embedding 管线到底谁更有效。
- 适合给大型仓库构建本地 benchmark，衡量 agent 在真实代码库中的定位与检索效率。

## 对客户端架构 / 代码理解 / Agent Infra / 研发效能 / 工程自动化的启示

- **客户端架构**：客户端大仓最难的常常不是写 patch，而是快速找到跨端共享逻辑、平台适配层和构建脚本的真实影响点。
- **代码理解**：这篇论文直接说明 file-level localization 已经不够，line-level coverage 和 efficient ranking 才是下一轮差异化指标。
- **Agent Infra**：如果 runtime 没有好的 exploration stage，后续 planning、patching 和 testing 都会被错误上下文污染。
- **研发效能**：更好的上下文命中率会减少无效搜索和返工，对长任务吞吐很关键。
- **工程自动化**：建议把 exploration score 纳入企业内部 agent eval，而不是只看最终任务成败。

## 风险限制

- 论文目前是 arXiv 预印本，尚未经过会议正式评审。
- ground truth 来自成功 agent trajectories，可能会偏向当前主流求解路径而非唯一正确上下文。
- 企业私有仓库的代码结构、依赖图和历史包袱与开源仓库不同，迁移前应做内部复现。

## 后续跟进行动

- 跟踪是否进入 ICSE/FSE/ASE 或出现开源 benchmark / leaderboard。
- 基于内部高频问题构建类 SWE-Explore 子集，用于评估客户端 / 基建仓库的代码探索能力。

## 原文依据提要

- 论文指出现有 repository-level benchmark 往往把 coding task 当成二元成功/失败问题，忽略 repository understanding、context retrieval、code localization 和 bug diagnosis。
- SWE-Explore 要求 agent 在固定行预算下返回相关代码区域排序列表，并评估 coverage、ranking、context-efficiency 与下游修复表现的关系。
