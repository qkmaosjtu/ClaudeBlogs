# AI Native 工程雷达 Monitor

本目录保存 AI Native 软件工程情报站的监控状态、历史 Claude Blog 回填结果和站点索引生成逻辑。

## 定位

站点面向大型互联网公司的客户端架构负责人，关注从传统客户端架构向 AI Native 软件工程架构演进过程中的工程问题，而不是普通业务功能开发。

核心关注：

- 软件工程效率、研发效能和工程自动化。
- AI Agent、Agent Runtime、Agent Workflow、Tool Use、MCP 和 Agent Memory。
- Code Intelligence、Repository Understanding、代码图、静态/动态分析、影响面分析和依赖分析。
- AI4SE、SE4AI、Program Analysis、Testing、Verification 和 Agent Evaluation。
- 客户端基础架构中能被 AI 改造的软件工程问题。

机器可读策略保存在：

```text
monitoring/ai_native_engineering_strategy.json
```

## 优先级规则

- `P0 立即跟进`：新的 Coding Agent、Claude Code / Cursor 重大更新、Agent Runtime 新架构、Repository Understanding 新论文、ICSE/FSE/ASE 最佳论文或 AI4SE 重大突破。
- `P1 每日研判`：软件工程论文、Agent Infra 实践、Code Intelligence 实践、企业级 AI Coding 案例。
- `P2 收藏观察`：普通 LLM 更新、普通 Agent 文章、一般 RAG 文章，只有和 AI Software Engineering 直接相关时保留。

需要主动降权过滤：

- AI 绘画、AI 视频、AI 营销。
- Prompt Engineering 技巧、ChatGPT 使用技巧、普通大模型新闻。
- 一般创业融资新闻、普通前端框架更新、普通移动开发教程。

## 日更来源

当前历史归档来自 `https://claude.com/blog`。后续每日任务按策略扩展到：

- Anthropic / Claude Blog
- OpenAI News / Research
- Google DeepMind Blog
- GitHub Blog / Changelog
- Cursor / Cognition AI
- ICSE / FSE / ASE / arXiv

## Detection Contract

- 使用 `monitoring/claude_blog/seen_articles.json` 作为 Claude Blog 的持久状态文件。
- 每次运行应读取 `monitoring/ai_native_engineering_strategy.json`，按 A/B/C 关注领域和 P0/P1/P2 规则判断文章价值。
- 对重点来源提取 canonical URL、标题、发布日期、作者或来源、分类/标签和正文摘要。
- 同一 canonical URL 不重复生成报告。
- P0 内容应优先生成独立报告并在站点中置于 P0 过滤入口；P1/P2 内容进入每日归档。
- 不确定的事实必须明确标注，不要编造原文未支持的信息。

## Report Output

每篇入选文章创建 Markdown 和 HTML 两份报告：

```text
monthly_report/YYYY-MM/daily_report/YYYY-MM-DD/YYYY-MM-DD_<slug>.md
monthly_report/YYYY-MM/daily_report/YYYY-MM-DD/YYYY-MM-DD_<slug>.html
```

报告应包含：

- 源信息：标题、URL、发布日期、来源、检测时间。
- 价值判断：P0/P1/P2、命中的关注领域、入选理由和降权因素。
- 整体摘要。
- 技术创新点分析。
- 企业场景可参考分析。
- 对客户端架构、代码理解、Agent Infra、研发效能或工程自动化的启示。
- 风险/限制和后续跟进行动。

HTML 报告必须是独立 UTF-8 文档，带简洁内联 CSS，并与 Markdown 内容实质一致。

## Site Index

根目录 `index.html` 由以下脚本生成：

```sh
node monitoring/claude_blog/build_site_index.mjs
```

索引页会读取历史报告，按策略自动打上：

- P0/P1/P2 优先级。
- A/B/C 关注领域。
- 命中信号和相关度分数。
- 月份、领域、优先级和全文检索过滤器。

## Backfill

Claude Blog 历史回填由以下脚本生成：

```sh
node monitoring/claude_blog/backfill_2025_reports.mjs
```

回填会写入：

- `monitoring/claude_blog/backfill_2025_index.json`
- `monthly_report/claude_blog_2025_backfill_index.md`
- `monthly_report/YYYY-MM/daily_report/YYYY-MM-DD/` 下的 Markdown 和 HTML 报告。
