# Skills 体系不集成任何 issue tracker

Wayfinder 的 map 与 decision records 完全住在 repo 内（`docs/wayfinding/`），`implement` 的输入收敛为 spec 与 OpenSpec tasks。为任何 issue tracker（GitHub Issues、GitLab、Linear、Jira 等）增加读写集成不在范围内。

## 为什么这不在范围内

每个 issue tracker 集成都会把一种 CLI 形态硬编码进 skills（命令、flag、输出解析），是永久维护面：它必须随着工具 CLI 的演进继续可用，也必须持续针对各工作流测试。上游版本曾支持包括 GitHub、GitLab、local markdown 在内的多种后端；2026-09，`wayfinder` 完成去 tracker 化，map 与 decisions 改为落在 repo 内 markdown，`implement` 的 tracker-ticket 输入模式同步移除。体系内不再有任何 tracker 数据的生产者或消费者，任何 tracker 集成都失去了落点。

曾采用的「仅限主流工具」策略（只考虑 GitHub、GitLab、Backlog.md 等知名工具）由本记录取代：主流工具也不再集成。

## Prior requests

- #99 — "Add dex as an issue tracker backend"（dex 当时约 3 个月大，约 300 stars）
