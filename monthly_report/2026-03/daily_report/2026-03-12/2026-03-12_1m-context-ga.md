# 1M context is now generally available for Opus 4.6 and Sonnet 4.6

## 源信息

- 原文标题：1M context is now generally available for Opus 4.6 and Sonnet 4.6
- 原文链接：https://claude.com/blog/1m-context-ga
- 发布日期：2026-03-12
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Product announcements
- 产品：Claude Platform
- 关键词：agent, Claude Code, context, 1M, enterprise

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、Claude Code 与软件工程、模型能力与上下文。官方摘要指出：Standard pricing now applies across the full 1M window for both models, with no long-context premium. Media limits expand to 600 images or PDF pages. 从正文结构看，文章围绕 Long context that holds up 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **长上下文与记忆能力**：通过更长上下文、会话管理、memory 或缓存策略提升跨文档、跨任务、跨会话工作的连续性。
- **产品化路径清晰**：文章呈现的重点不是单点模型能力，而是把 Claude 能力嵌入明确角色、流程、工具链和治理边界中。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **销售、客户成功与市场**：适合账户研究、线索跟进、个性化外联、客户洞察和营销内容生产；应把 CRM、邮件和审批流程纳入治理。
- **内部流程自动化**：可先选择高频、低风险、结果可人工校验的流程试点，再逐步接入业务系统和权限边界。
- **组织能力沉淀**：把提示词、模板、工具调用和验收标准沉淀为团队资产，降低个人经验依赖。

## 实践启示

- 以“智能体与工作流自动化”为试点主题，选择一个可衡量、可回滚、人工可复核的流程做 PoC。
- 为每类工具调用定义权限、数据范围、日志记录、失败升级和人工审批规则。
- 建立评估集：覆盖正常输入、边界输入、权限不足、外部系统失败和输出格式不合规等情况。
- 把提示词、工作流、模板和连接器配置纳入版本管理，避免能力散落在个人聊天记录中。

## 风险与限制

- 原文是产品/实践介绍，不等于企业环境可直接无改造上线；需要结合内部权限、数据分类和审计要求评估。
- 智能体一旦连接真实系统，风险从“回答错误”扩展到“执行错误”，必须限制动作范围并保留人工兜底。
- 文章中的客户案例或产品能力可能依赖特定版本、地区、账户权限或 beta 状态，实施前应复核官方文档。

## 原文依据提要

- Standard pricing now applies across the full 1M window for both models, with no long-context premium. Media limits expand to 600 images or PDF pages.
- 正文重点章节：Long context that holds up
- Claude Opus 4.6 and Sonnet 4.6 now include the full 1M context window at standard pricing on the Claude Platform. Standard pricing applies across the full window — $5/$25 per million tokens for Opus 4.6 and $3/$15 for Sonnet 4.6. There's no multiplier: a 900K-token request is billed at the same per-token rate as a 9K one.
- 1M context is now included in Claude Code for Max, Team, and Enterprise users with Opus 4.6. Opus 4.6 sessions can use the full 1M context window automatically, meaning fewer compactions and more of the conversation kept intact. 1M context previously required extra usage.
