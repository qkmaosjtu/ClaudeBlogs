# Seeing like an agent: how we design tools in Claude Code

## 源信息

- 原文标题：Seeing like an agent: how we design tools in Claude Code
- 原文链接：https://claude.com/blog/seeing-like-an-agent
- 发布日期：2026-04-09
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Claude Code
- 产品：Claude Code
- 关键词：agent, agents, Claude Code, MCP, skills, subagents, API, context, data, prompt caching

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、Claude Code 与软件工程、平台 API 与集成能力、知识工作与办公生产力、模型能力与上下文。官方摘要指出：Building Claude Code: How Anthropic designs and refines AI agent tools like AskUserQuestion and Task tool. The key is progressive disclosure and learning to &quot;see like an agent&quot; to maximize effectiveness. 从正文结构看，文章围绕 Improving elicitation with the AskUserQuestion tool、Attempt 1: Editing the ExitPlanTool、Attempt 2: Changing output format、Attempt 3: The AskUserQuestion Tool 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **可复用技能封装**：Skills 把说明、脚本、模板和资产打包成可复用能力单元，适合把组织经验固化为智能体可调用的操作手册。
- **长上下文与记忆能力**：通过更长上下文、会话管理、memory 或缓存策略提升跨文档、跨任务、跨会话工作的连续性。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **企业知识与办公流程**：适合跨文档检索、PPT/Excel/Word/Outlook 协作、会议材料生成和知识问答；关键是权限继承和引用来源可查。
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

- Building Claude Code: How Anthropic designs and refines AI agent tools like AskUserQuestion and Task tool. The key is progressive disclosure and learning to &quot;see like an agent&quot; to maximize effectiveness.
- 正文重点章节：Improving elicitation with the AskUserQuestion tool
- 正文重点章节：Attempt 1: Editing the ExitPlanTool
- 正文重点章节：Attempt 2: Changing output format
- 正文重点章节：Attempt 3: The AskUserQuestion Tool
- One of the hardest parts about building an agent harness is constructing its tools.
- Claude acts completely through tool calling , but there are a number of ways tools can be constructed in the Claude API with primitives like bash , skills and code execution . (You can read more about programmatic tool calling on the Claude API in @RLanceMartin's new article ).
