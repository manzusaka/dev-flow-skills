# Write tasks.md

本 reference 只在 `/to-plan` 的 Step 6 使用。严格按项目 tasks template 和 checkbox 格式编写。每个 `## N. ...` group 是贯穿相关层、可独立验证、适合一个 fresh context window 的 tracer-bullet vertical slice。

1. 运行 `spect instructions tasks --change <change-name>`，按依赖清单读取 proposal、specs、design 等文件；若 Step 5 生成 stack 文档，也读取它。
2. 每项用 `- [ ] N.M ...` 描述可验证结果；按真实依赖排序，不加 `Blocked by` 字段。必要的 prefactoring 放在所解锁 slice 前；wide refactor 用 expand → migrate batches → contract，仅在无法独立保持 green 时加最终 integrate-and-verify task。
3. 展示完整计划，确认 slices、粒度、顺序和验证方式；获批后写入并运行 `spect status --change <change-name> --json` 确认 planning 状态。
