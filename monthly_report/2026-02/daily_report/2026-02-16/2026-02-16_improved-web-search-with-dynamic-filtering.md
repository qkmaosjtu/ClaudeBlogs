# Increase web search accuracy and efficiency with dynamic filtering

## 源信息

- 原文标题：Increase web search accuracy and efficiency with dynamic filtering
- 原文链接：https://claude.com/blog/improved-web-search-with-dynamic-filtering
- 发布日期：2026-02-16
- 检测/生成时间：2026-06-13T12:17:15.239Z
- 分类：Product announcements
- 产品：Claude Platform
- 关键词：agent, agents, API, context, workflow, data, web search, citations

## 整体摘要

这篇文章聚焦于 智能体与工作流自动化、平台 API 与集成能力、知识工作与办公生产力、模型能力与上下文。官方摘要指出：Claude&#39;s web search and web fetch tools now use code execution to dynamically filter results before they reach the context window. Benchmarks show accuracy gains averaging 11% while using 24% fewer input tokens. Available now on the API. 从正文结构看，文章围绕 Web search with dynamic filtering、Evaluating Claude’s ability to search the web ‍、Customer spotlight: Quora、Dynamic filtering in the web search and fetch tools 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

- **工具与外部系统连接**：通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。
- **长上下文与记忆能力**：通过更长上下文、会话管理、memory 或缓存策略提升跨文档、跨任务、跨会话工作的连续性。
- **结构化和可验证输出**：通过 structured outputs、citations、evals 或 observability 强化结果格式、来源可追踪性和运行质量监测。

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

- Claude&#39;s web search and web fetch tools now use code execution to dynamically filter results before they reach the context window. Benchmarks show accuracy gains averaging 11% while using 24% fewer input tokens. Available now on the API.
- 正文重点章节：Web search with dynamic filtering
- 正文重点章节：Evaluating Claude’s ability to search the web ‍
- 正文重点章节：Customer spotlight: Quora
- 正文重点章节：Dynamic filtering in the web search and fetch tools
- Alongside Claude Opus 4.6 and Sonnet 4.6 , we’re releasing new versions of our web search and web fetch tools. Claude can now natively write and execute code during web searches to filter results before they reach the context window, improving its accuracy and token efficiency.
- Web search is a highly token-intensive task. Agents using basic web search tools need to make a query, pull search results into context, fetch full HTML files from multiple websites, and reason over it all before responding. But the context being pulled in from search is often irrelevant, which degrades the quality of the response. To improve Claude’s performance on web searches, our web search and web fetch tools now automatically write and execute code to post-process query results. Instead of reasoning over full HTML files, Claude can dynamically filter the search results before loading them into context, keeping only what’s relevant and discarding the rest. We’ve previously found this technique to be effective across other agentic workflows, and we’ve added tools such as code execution and programmatic tool calling for native support on our API. We’re now bringing these same techniques to web search and web fetch.
