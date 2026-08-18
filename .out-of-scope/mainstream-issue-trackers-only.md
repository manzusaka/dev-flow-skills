# Issue tracker 集成仅限主流工具

`setup-skills` 只对**主流** issue tracker 提供一等支持。为小众、新兴或单一厂商的实验性 tracker 增加支持不在范围内。

## 为什么这不在范围内

每个 issue-tracker 后端都会把一种 CLI 形态硬编码进 skills（命令、flag、输出解析）。每新增一个后端，都是永久维护面：它必须随着工具 CLI 的演进继续可用，也必须持续针对 `/to-tickets`、`/triage` 等工作流测试。只有当相当一部分用户确实使用某个 tracker 时，这个成本才值得付。

“主流”是判断，不是数字门槛：

- GitHub、GitLab 和 Backlog.md 属于我们会考虑的主流工具：知名、广泛使用，并且早已过了实验阶段。
- 一个刚出现、面向 agent、只有几百个 GitHub stars 的工具，即使设计很有意思，也不算。

Stars、存在时间和下载量都是判断时有用的信号，但都不是规则。真正的规则是：一个典型工程师会认得这个工具，并且可能已经为团队选择它吗？

非主流 tracker 已经有逃生口：

- `local markdown`，用于轻量的 repo 内跟踪。
- `other/custom`，用于想自己接入工作流的用户。

两者都不要求核心 skills 理解具体工具。

## Prior requests

- #99 — "Add dex as an issue tracker backend"（dex 当时约 3 个月大，约 300 stars）
