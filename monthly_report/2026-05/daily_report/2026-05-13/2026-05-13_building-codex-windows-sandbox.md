# Building a safe, effective sandbox to enable Codex on Windows

## 源信息

- 来源：OpenAI Engineering
- 原文标题：Building a safe, effective sandbox to enable Codex on Windows
- 原文链接：https://openai.com/index/building-codex-windows-sandbox/
- Canonical URL：https://openai.com/index/building-codex-windows-sandbox/
- 发布日期：2026-05-13
- 检测/生成时间：2026-06-13T23:09:39.777Z

## P0/P1/P2 价值判断

- 等级：P0
- 判断依据：这是直接讨论 coding agent 执行层、安全边界和 OS 级 sandbox 的一手工程实现，明显属于 Agent Runtime 基础设施。

## 命中关注领域

- Agent Systems
- AI for Software Engineering
- 大规模工程实践

## 整体摘要

OpenAI 详细披露了 Codex 在 Windows 上的 sandbox 设计，从最初的“几乎每条命令都要审批”与“Full Access 无保护”两难，演进到包含专用用户、受限 token、ACL、firewall rule 和独立 command runner 的执行架构。

对于 AI Native 工程团队，这篇文章的价值在于把“安全可用的 coding agent”拆解成操作系统原语、权限模型、网络限制和进程创建链路，而不是只停留在产品层。

## 技术创新点分析

- **从零组合 Windows 原语**：原文逐个否决 AppContainer、Windows Sandbox、MIC labeling，最后用 synthetic SID、write-restricted token、专用本地用户和 firewall 组合出可用方案。
- **在线/离线双主体设计**：`CodexSandboxOffline` 与 `CodexSandboxOnline` 的区分，把是否允许联网做成 principal 级策略，而不是会被子进程绕过的环境变量伪隔离。
- **分离 setup 与 command runner**：`codex-windows-sandbox-setup.exe` 与 `codex-command-runner.exe` 把高权限准备阶段和日常受限执行阶段解耦，降低主 harness 复杂度扩散。
- **workspace 级写权限模型**：通过 restricted SID + ACL 精准开放 cwd 与 `writable_roots`，同时显式拒绝 `.git`、`.codex` 等目录写入。

## 企业场景可参考分析

- **企业 Windows 开发环境**：适合大量 Windows 开发机、受管桌面或混合操作系统团队参考其 sandbox 设计权衡。
- **安全基线建设**：说明 coding agent 的默认权限、安全隔离和网络抑制需要纳入端侧安全治理，而不是只依赖云侧模型策略。
- **内部 agent 平台**：如果企业也在自建本地 agent harness，这篇文章可直接作为 Windows 执行层设计参考。

## 对客户端架构 / 代码理解 / Agent Infra / 研发效能 / 工程自动化的启示

- **客户端架构**：面向 Windows 桌面和 IDE 插件的团队，需要把 agent sandbox 当成一等基础能力，否则跨平台一致性会被 OS 差异拖垮。
- **代码理解**：高质量代码理解并不足够，真正可落地还取决于 agent 能否在受限环境内稳定读取代码、运行测试和生成变更。
- **Agent Infra**：per-command sandbox、network policy、token principal、filesystem ACL 和 runner binary 是值得抽象成平台能力的核心模块。
- **研发效能**：安全边界做对之后，才能减少人工审批噪音，释放 agent 真正的自动化吞吐。
- **工程自动化**：Windows 生态常被忽略，这篇文章提醒平台团队要把本地端执行安全视作自动化主战场。

## 风险限制

- 方案本身较复杂，依赖提升权限的首次 setup、额外本地用户和大量 ACL/firewall 规则维护。
- 文章是 OpenAI 当前实现经验，不代表 Windows 或其他 agent harness 的唯一正确做法。
- 如果企业有更严格的 EDR、组策略或虚拟化限制，落地成本会高于文章展示的理想环境。

## 后续跟进行动

- 继续跟踪 OpenAI 是否披露更多关于网络白名单、审计日志和 sandbox 可观测性的实现细节。
- 评估内部 Windows 开发机是否也需要区分 offline/online agent principal。
- 梳理本地 agent 运行时在 macOS、Linux、Windows 三端的能力矩阵，避免策略不一致。

## 原文依据提要

- 原文在开头明确给出 Windows 用户此前只能在“频繁审批”和“Full Access”之间二选一。
- 文章详细讨论了 AppContainer、Windows Sandbox 和 Mandatory Integrity Control 为什么不适合 open-ended developer workflows。
- 最终架构包含 `codex.exe`、sandbox setup binary、command runner 和 child process 四层，并通过专用用户和 firewall rule 抑制网络访问。
