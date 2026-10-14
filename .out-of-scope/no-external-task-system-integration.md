# Skills 体系不集成外部任务管理系统

Wayfinder 的 map 与 decision records 完全住在 repo 内（`docs/wayfinding/`），`implement` 的输入收敛为 spec 与 OpenSpec tasks。外部任务管理系统的读写集成不在范围内。

## 为什么这不在范围内

外部任务管理系统的集成会把各自的 CLI 形态硬编码进 skills（命令、flag、输出解析），并带来持续的兼容与测试成本。当前流程直接使用 repo 内的 decision records、spec 与 OpenSpec tasks，没有外部任务数据的生产者或消费者。
