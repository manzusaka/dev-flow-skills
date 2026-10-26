# Confirm durable docs

本 reference 只在 `/to-plan` 的 Step 7 使用。按 `/domain-modeling` 的内容边界和格式处理 Step 3 暂存的候选：

- `CONTEXT.md` 只补项目特有 canonical terms，不写业务行为、spec、实现细节或设计摘要。
- 仅为 Step 3 中同时满足 hard to reverse、surprising without context、real trade-off 三项门槛的决定建 ADR；change-specific 决定留在 `design.md`，stack 文档说明已确认方案的实现落点。
- 新 ADR 引用 OpenSpec change，必要时在 `design.md` 引用 ADR，不复制论证。

展示 `CONTEXT.md`、ADR 及必要的 `design.md` diff，获批后才写入；无合格候选则不建空文件。
