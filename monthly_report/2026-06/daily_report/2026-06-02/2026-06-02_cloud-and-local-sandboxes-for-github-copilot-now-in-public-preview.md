# Cloud and local sandboxes for GitHub Copilot now in public preview

## 源信息

- 来源：GitHub Changelog
- 原文标题：Cloud and local sandboxes for GitHub Copilot now in public preview
- 原文链接：https://github.blog/changelog/2026-06-02-cloud-and-local-sandboxes-for-github-copilot-now-in-public-preview/
- Canonical URL：https://github.blog/changelog/2026-06-02-cloud-and-local-sandboxes-for-github-copilot-now-in-public-preview/
- 发布日期：2026-06-02
- 检测/生成时间：2026-06-13T23:09:39.777Z

## P0/P1/P2 价值判断

- 等级：P0
- 判断依据：命中 secure execution layer、cloud/local sandbox、governance 与 policy controls，是典型的 agent runtime 基础设施更新。

## 命中关注领域

- Agent Systems
- AI for Software Engineering
- 大规模工程实践

## 整体摘要

GitHub 把 Copilot 的执行环境产品化为统一的 local sandbox 和 cloud sandbox，两者都服务于 agentic development 的安全执行层。它不只是“让模型能跑命令”，而是把代码、工具、文件系统和网络访问放进可治理的隔离边界里。

对大团队而言，这意味着 agent 自动化终于有了与企业治理体系兼容的默认承载层，能够复用组织已有的身份、策略与隔离控制。

## 技术创新点分析

- **执行层被显式产品化**：GitHub 直接把 sandbox 定义为 agentic development 的 foundational infrastructure，而不是某个隐形实现细节。
- **本地与云侧策略统一**：本地沙箱和 `copilot --cloud` 云侧 Linux sandbox 共享同一套 Copilot cloud agent policy 思路，降低组织治理碎片化。
- **与现有控制面联动**：文章强调 cloud session 继承已有 cloud agent policies，说明执行环境与组织政策、身份、成本管理开始整合。

## 企业场景可参考分析

- **受监管开发环境**：适合对源码、网络访问和工具调用有合规要求的企业先把 agent 放在沙箱内试点。
- **平台团队统一基线**：可以作为本地 IDE agent、CLI agent 和云端 batch agent 的公共执行层。
- **多仓库自动化**：当 agent 开始读写真实仓库、执行测试和联网依赖安装时，sandbox 成为默认门槛，而不是附加选项。

## 对客户端架构 / 代码理解 / Agent Infra / 研发效能 / 工程自动化的启示

- **客户端架构**：面向桌面 IDE、CLI 与云端 agent 协同的客户端平台，需要把 local/cloud sandbox 视作同一产品能力而非分裂功能。
- **代码理解**：repo understanding 的价值只有在受控执行环境里才能持续转化为安全自动化。
- **Agent Infra**：隔离、身份、策略继承、session provisioning 和 ephemeral environment 将成为通用 runtime 组件。
- **研发效能**：统一沙箱能减少平台安全团队对 agent 自动化的阻力，缩短试点落地时间。
- **工程自动化**：未来 CI agent、IDE agent、workflow agent 可能都会建立在同类 sandbox substrate 之上。

## 风险限制

- public preview 阶段的能力边界、性能和计费模型仍可能变化。
- 云沙箱能否满足企业定制镜像、私有依赖和内网访问要求，官方更新里还没有展开。
- 如果组织没有清晰的 policy inheritance 与审计机制，沙箱仍可能被当作黑盒执行环境。

## 后续跟进行动

- 继续跟踪 GitHub 对 local sandbox 的 OS 支持范围、审计日志和 policy schema 的公开细节。
- 比较 GitHub sandboxes 与 OpenAI/Anthropic/Cursor 在本地执行隔离上的设计差异。
- 梳理企业内部哪些 agent 场景必须要求 sandbox 才能进入生产。

## 原文依据提要

- 官方描述写明 Copilot 可以在 secure, isolated sandboxes 中运行，覆盖 local 和 cloud 两种模式。
- 文章把 agentic development 描述为 interactive、stateful、parallel，因此需要专门的 execution layer。
- 云沙箱通过 `copilot --cloud` 启动，并继承组织现有的 Copilot cloud agent policies。
