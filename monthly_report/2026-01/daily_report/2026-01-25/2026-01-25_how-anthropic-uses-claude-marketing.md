# How Anthropic&#39;s Growth Marketing team cut ad creation time from 30 minutes to 30 seconds with Claude Code

## 源信息

- 原文标题：How Anthropic&#39;s Growth Marketing team cut ad creation time from 30 minutes to 30 seconds with Claude Code
- 原文链接：https://claude.com/blog/how-anthropic-uses-claude-marketing
- 发布日期：2026-01-25
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Enterprise AI
- 产品：Claude Enterprise
- 关键词：agent, Claude Code, skills, API, workflow, data, sales, marketing

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、Claude Code 与软件工程、平台 API 与集成能力、知识工作与办公生产力、行业落地。官方摘要指出：Marketers spend hours creating ad variations and refreshing copy across platforms. Learn how Anthropic&#39;s growth team uses Claude Code to cut ad creation from 30 minutes to 30 seconds—no coding required. 从正文结构看，文章围绕 The problem: Drowning in copy and creative variations、The solutions: Two workflows that eliminated marketing busywork、Figma plugin for creative variations、Google Ads copy generation 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **面向开发者的智能体工程化**：Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。
- **可复用技能封装**：Skills 把说明、脚本、模板和资产打包成可复用能力单元，适合把组织经验固化为智能体可调用的操作手册。
- **结构化和可验证输出**：通过 structured outputs、citations、evals 或 observability 强化结果格式、来源可追踪性和运行质量监测。
- **多模态与交互界面**：Artifacts、文件创建、浏览器/电脑使用等能力把模型输出扩展到可检查、可编辑、可执行的工作界面。

## 企业场景可参考分析

- **研发组织提效**：适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。
- **企业知识与办公流程**：适合跨文档检索、PPT/Excel/Word/Outlook 协作、会议材料生成和知识问答；关键是权限继承和引用来源可查。
- **销售、客户成功与市场**：适合账户研究、线索跟进、个性化外联、客户洞察和营销内容生产；应把 CRM、邮件和审批流程纳入治理。

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

- Marketers spend hours creating ad variations and refreshing copy across platforms. Learn how Anthropic&#39;s growth team uses Claude Code to cut ad creation from 30 minutes to 30 seconds—no coding required.
- 正文重点章节：The problem: Drowning in copy and creative variations
- 正文重点章节：The solutions: Two workflows that eliminated marketing busywork
- 正文重点章节：Figma plugin for creative variations
- 正文重点章节：Google Ads copy generation
- Before Claude Code, Austin Lau had never written a line of code in his life. When the product first launched, he had to Google how to open a terminal on his computer.
- "My first reaction when we launched Claude Code was, I have zero idea what this product is for," says Austin, a growth marketer at Anthropic. "As a marketer, it just didn't really click—the use case wasn't obvious to me yet."
