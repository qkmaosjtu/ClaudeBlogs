# The evolution of agentic surfaces: building with Claude Managed Agents

## 源信息

- 原文标题：The evolution of agentic surfaces: building with Claude Managed Agents
- 原文链接：https://claude.com/blog/building-with-claude-managed-agents
- 发布日期：2026-06-09
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Agents
- 产品：Claude Platform
- 关键词：agent, agents, Claude Code, Managed Agents, MCP, hooks, subagents, API, context, security

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、Claude Code 与软件工程、平台 API 与集成能力、企业治理与安全、知识工作与办公生产力、行业落地、模型能力与上下文。官方摘要指出：Claude Managed Agents allows teams to build and deploy agents in production environments reliably at scale. Here’s why and how teams are using it.  从正文结构看，文章围绕 Evolving the agent architecture、When and why to use Claude Managed Agents、Building for production and scale on Managed Agents、How customers are building on Managed Agents today 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **托管式智能体运行模型**：把任务执行、会话、调度、工具访问和运行环境从应用代码中剥离出来，降低企业从原型走向稳定运行的工程负担。
- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **安全边界前移**：围绕权限、vault、域名 allowlist、管理员控制、审计与合规 API 设计执行边界，让自动化能力可以被治理而不是只能被禁用。
- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **可复用技能封装**：Skills 把说明、脚本、模板和资产打包成可复用能力单元，适合把组织经验固化为智能体可调用的操作手册。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **运营与周期性报告**：适合日报、周报、指标巡检、数据同步、合规扫描和例行摘要；价值来自稳定调度、状态记录和异常升级。
- **企业知识与办公流程**：适合跨文档检索、PPT/Excel/Word/Outlook 协作、会议材料生成和知识问答；关键是权限继承和引用来源可查。
- **销售、客户成功与市场**：适合账户研究、线索跟进、个性化外联、客户洞察和营销内容生产；应把 CRM、邮件和审批流程纳入治理。
- **金融、法律、医疗等强监管行业**：适合分析、摘要、审查、证据整理和专家辅助决策；落地前必须定义数据边界、人工复核和合规留痕。

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

- Claude Managed Agents allows teams to build and deploy agents in production environments reliably at scale. Here’s why and how teams are using it. 
- 正文重点章节：Evolving the agent architecture
- 正文重点章节：When and why to use Claude Managed Agents
- 正文重点章节：Building for production and scale on Managed Agents
- 正文重点章节：How customers are building on Managed Agents today
- Getting an agent into production takes more than a good prompt. The agent needs somewhere to run the code it writes, credentials to reach your data, observable sessions, and infrastructure that scales with usage. On the Applied AI team, we work at the intersection of product, research, and the customers building on Claude—and we see the same pattern repeatedly: infrastructure is what separates a prototype from a production agent. All too often, teams burn development cycles on security, state management, permissioning, and harness tuning.
- Claude Managed Agents , our suite of composable APIs for building and deploying production-grade agents, pairs an agent harness tuned for performance with production infrastructure, allowing teams to go from prototype to launch in days rather than months. In this post, we'll cover the evolution of Anthropic’s agentic building blocks, why we built Claude Managed Agents, and how teams are using it in production today.
