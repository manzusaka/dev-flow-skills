# Design stack

本 reference 只在 `/to-plan` 的 Step 5 判断需要 stack 文档时读取。将前面已确认的架构和流程设计落实为代码、数据及运行层面的实施说明，产出项目 root 的 `docs/architecture/<change-name>-stack.md`。

沿用 `/to-plan` 前面已确认的材料与代码事实，只有具体信息缺失时才补查。行为要求以 specs 为准，方案决定以 `design.md` 和现行 ADR 为准；合法 `skip_specs: true` 时以 proposal 和 design 为依据。

## Process

1. 优先明确适用的 DDD 代码落点、数据库表结构、关键 Interface 与集成契约、设计模式的参与角色，再补充并发或故障处理、迁移和运行配置等实现约束。只解决如何实现；若发现已确认的领域、架构或流程决定有缺口，返回规划讨论，不能在 stack 文档中自行定案。
2. 阅读 [stack-template.md](stack-template.md) 作为起草参考，按本次 change 裁剪章节。标明 change 与依据，写出足以指导 `tasks.md` 拆分和验证的具体实现约束；引用 `design.md` 或 ADR 中的决定，不重复其设计或论证。
3. 展示完整草稿，获用户确认后确保 `docs/architecture/` 存在并写入。目标文件已存在时不覆盖。检查文档与 specs、design 和代码现状一致，引用有效，没有影响实现的未决问题、模板提示或占位符。
