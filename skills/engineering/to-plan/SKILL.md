---
name: to-plan
description: 读取 `/to-spec` 确认的 OpenSpec proposal 与 delta specs，编写 design.md、tasks.md 及长期领域文档。
disable-model-invocation: true
---

# To Plan

将已确认的 proposal 和 delta specs 写成可执行的 `design.md`、`tasks.md`。调用：`/to-plan [change-name]`。仅写首次规划的 design、tasks 和获批的长期文档；不创建 change 或实现代码。缺 flow docs 或 proposal 时停止，提示用户显式运行 `/setup-skills` 或 `/to-spec`；行为契约需变更时报告冲突并停止。

## Process

### 1. Resolve the change

先运行 `spect --version`；若 command not found，调用 `/init-cli`，安装完成前不继续。

在项目根目录运行：

```bash
spect list --json
```

用 `spect` 完成 change discovery、artifact resolution 和 validation。`spect list` 返回 `changes + root` JSON，列出非隐藏、未归档 changes 的名称、任务完成度与状态。

- `change-name` 与目录精确匹配时直接选用；无参数则列出全部 active changes 供用户选择。
- 其余输入视为完整 query：转小写、将空格和下划线改为连字符、折叠重复连字符，依次尝试 normalized exact、prefix、substring、fuzzy；语义匹配时读取候选 proposal 摘要。
- 无精确目录匹配时按相关度排列合理候选，展示名称、匹配理由和 proposal 摘要供用户确认，不自行选近似项。
- 无 active change 则停止，不创建 change。

完成条件：用户已确认唯一的 `<change-name>`，目标目录是 `openspec/changes/<change-name>/`。

### 2. Check the artifact contract

在项目根目录运行：

```bash
spect status --change <change-name> --json
spect templates --json
```

从 `spect status` 读取 artifact graph 的 `outputPath`、`resolvedOutputPath`、`existingOutputPaths`、`isPlanningComplete`、`implementRequires`；由 `spect` 解析 config/schema、依赖和输出位置。`spect templates` 给出各 artifact 的模板路径。

据此读取并验证：

- `CONTEXT.md` 或 `CONTEXT-MAP.md` 指向的相关 context
- 相关当前版本 PRD（如存在；旧版不作当前依据）
- 相关 `docs/adr/` 和 context-scoped ADRs
- change 中的 `.openspec.yaml` 与 `proposal.md`
- proposal 声明的现有 capability specs、相关代码和测试

当前 schema 须生成 `specs/**/*.md`、`design.md`、`tasks.md`，且以 `tasks.md` 追踪 implement；项目 `openspec/` 文件是唯一依据。

`spect status` 报错、proposal 有行为未决项、capability 未恰好对应一个 delta spec（合法 `skip_specs: true` 除外）时，停止并报告缺口。当前 PRD 内部或 PRD、现行 ADR、change 决定冲突时，列出双方文件位置和内容，停止并让用户决定是否回 `/to-prd` 或处理 change。已有 `design.md` 或 `tasks.md` 时停止，不复核或覆盖。

完成条件：proposal、delta specs、schema 和 templates 已盘点，行为契约完整，且目标 change 尚无 design 和 tasks。

### 3. Grill the design

围绕 proposal、已确认 specs、代码、测试接缝、领域文档和 ADR 运行完整的 `/grilling`。遍历 design tree，解决所有影响方案或任务拆分的决定，直到用户确认共同理解。行为契约需变化时指出来源并停止规划。环境事实由 agent 调查，架构和设计取舍交用户；覆盖适用的模块边界、数据流、兼容性、迁移/回滚、安全、性能与测试，不凭空增加工作。

在对话中暂存、此时不写入的长期文档候选：

- 已确定的项目特有 canonical domain terms
- 同时满足 hard to reverse、surprising without context、real trade-off 的 ADR 决定

完成条件：design tree frontier 为空，用户确认讨论充分，durable-doc candidates 已明确列出。

### 4. Write `design.md`

严格按项目 design template 写入；小 change 也创建精简 `design.md`，即使 schema 将其标为 conditional，但不编造决定。运行 `spect instructions design --change <change-name>`，按依赖清单重读磁盘文件。

- Context 写理解方案所需的现状和约束，动机引用 proposal；Goals / Non-Goals 只补设计边界。
- Decisions 写获确认的方案、理由和真实备选；Risks / Trade-offs 写风险与缓解。
- Migration Plan 仅在适用时写；Open Questions 仅留不影响 specs、方案或 tasks 的未知项。

展示完整草稿，获用户确认后写入；运行 `spect status --change <change-name> --json` 确认登记并查看下一步。完成条件：符合模板，影响实现的决定均获确认，无未授权假设或占位符。

### 5. Write `tasks.md`

严格按项目 tasks template 和 checkbox 格式编写。每个 `## N. ...` group 是贯穿相关层、可独立验证、适合一个 fresh context window 的 tracer-bullet vertical slice。

运行 `spect instructions tasks --change <change-name>`，按依赖清单重读 proposal、specs、design 等文件。

- 每项用 `- [ ] N.M ...` 描述可验证结果；按真实依赖排序，不加 `Blocked by` 字段。
- 必要的 prefactoring 放在所解锁 slice 前；wide refactor 用 expand → migrate batches → contract，仅在无法独立保持 green 时加最终 integrate-and-verify task。

展示完整计划，确认 slices、粒度、顺序和验证方式；获批后写入并运行 `spect status --change <change-name> --json` 确认 planning 状态。完成条件：每项均为合法 checkbox，可在单次 session 完成并验证，覆盖所有 proposal stories、spec requirements 和 design 决定。

### 6. Confirm durable docs

按 `/domain-modeling` 的内容边界和格式处理 Step 3 的候选：

- `CONTEXT.md` 只补项目特有 canonical terms，不写业务行为、spec、实现细节或设计摘要。
- 仅为 Step 3 中同时满足三项门槛的决定建 ADR；change-specific 决定留在 `design.md`。
- 新 ADR 引用 OpenSpec change，必要时在 `design.md` 引用 ADR，不复制论证。

展示 `CONTEXT.md`、ADR 及必要的 `design.md` diff，获批后才写入；无合格候选则不建空文件。完成条件：只含获批的长期知识，与 specs 和 design 一致。

### 7. Verify and report

在目标 repository root 运行：

```bash
spect validate <change-name> --strict --no-interactive
```

由 `spect` 检查 `requires` 依赖、`generates` 输出、`implement.tracks` 的 `tasks.md`，以及 proposal 和 delta specs 章节结构。另检查：

- 每个 capability 有 delta spec，或合法使用 `skip_specs: true`；delta specs 已经 `/to-spec` 确认。
- 无模板注释、占位符或影响实现的 open question；durable docs diff 与批准内容一致；tasks 覆盖 proposal、specs 和 design。

运行 `git diff --check`；通过后运行 `spect status --change <change-name> --json` 确认 `isPlanningComplete: true`。报告 change name、artifact 路径、durable docs 和结果。失败时保留获批 artifacts，报告失败项及安全的继续位置。

## Handoff Next Step

下一步由用户显式运行 `/implement <change-name>` 执行实现。
