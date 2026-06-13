# Put Claude to work on your computer

## 源信息

- 原文标题：Put Claude to work on your computer
- 原文链接：https://claude.com/blog/dispatch-and-computer-use
- 发布日期：2026-03-22
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Product announcements
- 产品：Claude apps
- 关键词：Claude Code, connectors, data, browser, computer use

## 整体摘要

这篇文章聚焦于 Claude Code 与软件工程、平台 API 与集成能力、企业治理与安全。官方摘要指出：Claude now opens your apps, navigates your browser, and runs your dev tools to complete tasks. Assign from your phone with Dispatch. Research preview on macOS. 从正文结构看，文章围绕 How Claude uses your computer、Message Claude from anywhere、Getting started 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **安全边界前移**：围绕权限、vault、域名 allowlist、管理员控制、审计与合规 API 设计执行边界，让自动化能力可以被治理而不是只能被禁用。
- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **多模态与交互界面**：Artifacts、文件创建、浏览器/电脑使用等能力把模型输出扩展到可检查、可编辑、可执行的工作界面。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **运营与周期性报告**：适合日报、周报、指标巡检、数据同步、合规扫描和例行摘要；价值来自稳定调度、状态记录和异常升级。
- **安全与风控**：适合代码安全审查、权限检查、日志分析、策略巡检和安全运营辅助；需要最小权限、隔离环境和可审计输出。

## 实践启示

- 以“Claude Code 与软件工程”为试点主题，选择一个可衡量、可回滚、人工可复核的流程做 PoC。
- 为每类工具调用定义权限、数据范围、日志记录、失败升级和人工审批规则。
- 建立评估集：覆盖正常输入、边界输入、权限不足、外部系统失败和输出格式不合规等情况。
- 把提示词、工作流、模板和连接器配置纳入版本管理，避免能力散落在个人聊天记录中。

## 风险与限制

- 原文是产品/实践介绍，不等于企业环境可直接无改造上线；需要结合内部权限、数据分类和审计要求评估。
- 智能体一旦连接真实系统，风险从“回答错误”扩展到“执行错误”，必须限制动作范围并保留人工兜底。
- 文章中的客户案例或产品能力可能依赖特定版本、地区、账户权限或 beta 状态，实施前应复核官方文档。

## 原文依据提要

- Claude now opens your apps, navigates your browser, and runs your dev tools to complete tasks. Assign from your phone with Dispatch. Research preview on macOS.
- 正文重点章节：How Claude uses your computer
- 正文重点章节：Message Claude from anywhere
- 正文重点章节：Getting started
- In Claude Cowork and Claude Code, you can now enable Claude to use your computer to complete tasks. When Claude doesn’t have access to the tools it needs, it will point, click, and navigate what’s on your screen to perform the task itself. It can open files, use the browser, and run dev tools automatically — with no setup required.
- This feature is now available in research preview for Claude Pro and Max subscribers. It works especially well with Dispatch , which lets you assign Claude tasks from your phone.
- Claude will reach for the most precise tool first, starting with connectors to services like Slack or Google Calendar. When there isn’t a connector, Claude can directly control your browser, mouse, keyboard, and screen to complete tasks. It will scroll, click to open, and explore as needed, always asking for your explicit permission first.
