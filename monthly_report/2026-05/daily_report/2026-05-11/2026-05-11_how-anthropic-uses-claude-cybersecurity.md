# How Anthropic&#39;s cybersecurity team built a threat detection platform with Claude Code

## 源信息

- 原文标题：How Anthropic&#39;s cybersecurity team built a threat detection platform with Claude Code
- 原文链接：https://claude.com/blog/how-anthropic-uses-claude-cybersecurity
- 发布日期：2026-05-11
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Claude Code
- 产品：Claude Code
- 关键词：agent, agents, Claude Code, API, context, security, data

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、Claude Code 与软件工程、平台 API 与集成能力、企业治理与安全、知识工作与办公生产力、模型能力与上下文。官方摘要指出：Jackie Bow, technical lead for Anthropic&#39;s Detection Platform Engineering team, shares how her team uses Claude Code to build tools that automate alert triage, accelerate investigations, and transform how security analysts work. 从正文结构看，文章围绕 The problem: Drowning in data and alerts、The solution: Claude Looks Up Evidence (CLUE)、CLUE Triage、CLUE Investigate 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **安全边界前移**：围绕权限、vault、域名 allowlist、管理员控制、审计与合规 API 设计执行边界，让自动化能力可以被治理而不是只能被禁用。
- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **长上下文与记忆能力**：通过更长上下文、会话管理、memory 或缓存策略提升跨文档、跨任务、跨会话工作的连续性。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **企业知识与办公流程**：适合跨文档检索、PPT/Excel/Word/Outlook 协作、会议材料生成和知识问答；关键是权限继承和引用来源可查。
- **安全与风控**：适合代码安全审查、权限检查、日志分析、策略巡检和安全运营辅助；需要最小权限、隔离环境和可审计输出。

## 实践启示

- 以“智能体与工作流自动化”为试点主题，选择一个可衡量、可回滚、人工可复核的流程做 PoC。
- 为每类工具调用定义权限、数据范围、日志记录、失败升级和人工审批规则。
- 建立评估集：覆盖正常输入、边界输入、权限不足、外部系统失败和输出格式不合规等情况。
- 把提示词、工作流、模板和连接器配置纳入版本管理，避免能力散落在个人聊天记录中。

## 风险与限制

- 原文是产品/实践介绍，不等于企业环境可直接无改造上线；需要结合内部权限、数据分类和审计要求评估。
- 智能体一旦连接真实系统，风险从“回答错误”扩展到“执行错误”，必须限制动作范围并保留人工兜底。
- 文章中的客户案例或产品能力可能依赖特定版本、地区、账户权限或 beta 状态，实施前应复核官方文档。
- 安全类场景要避免让模型直接成为最终裁决者，应将其定位为发现、解释和辅助修复环节。

## 原文依据提要

- Jackie Bow, technical lead for Anthropic&#39;s Detection Platform Engineering team, shares how her team uses Claude Code to build tools that automate alert triage, accelerate investigations, and transform how security analysts work.
- 正文重点章节：The problem: Drowning in data and alerts
- 正文重点章节：The solution: Claude Looks Up Evidence (CLUE)
- 正文重点章节：CLUE Triage
- 正文重点章节：CLUE Investigate
- For her entire career, Jackie Bow imagined tools that could tap into the context that actually matters—not just logs and alerts, but the Slack conversations, internal docs, and institutional knowledge that tell you whether something is a real threat or just noise—without needing humans to take the load of combing through the data manually.
- When she joined Anthropic, she finally got the chance to build them—with Claude as her collaborator. Jackie leads Anthropic's Detection Platform Engineering team, which focuses on defensive cybersecurity: detecting threats and responding to potential breaches rather than probing for vulnerabilities. The work involves monitoring systems for suspicious activity, triaging security alerts, and investigating anomalies before they become incidents.
