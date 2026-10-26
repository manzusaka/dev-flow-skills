# Write design.md

本 reference 只在 `/to-plan` 的 Step 4 使用。严格按项目 design template 写入；小 change 也创建精简 `design.md`，即使 schema 将其标为 conditional，但不编造决定。

1. 运行 `spect instructions design --change <change-name>`，按依赖清单读取磁盘文件。
2. Context 写理解方案所需的现状和约束，动机引用 proposal；Goals / Non-Goals 只补设计边界。Decisions 写获确认的方案、理由和真实备选；Risks / Trade-offs 写风险与缓解。Migration Plan 仅在适用时写；Open Questions 仅留不影响 specs、方案或 tasks 的未知项。
3. 展示完整草稿，获用户确认后写入；运行 `spect status --change <change-name> --json` 确认登记并查看下一步。
