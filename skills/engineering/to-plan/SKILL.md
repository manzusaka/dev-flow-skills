---
name: to-plan
description: 读取 `/to-spec` 确认的 OpenSpec proposal 与 delta specs，编写 design.md、按需设计 stack、tasks.md 及长期领域文档。
disable-model-invocation: true
---

# To Plan

将已确认的 proposal 和 delta specs 写成可执行的 `design.md`、按需编写的 stack 实现文档和 `tasks.md`。调用：`/to-plan [change-name]`。仅写首次规划的 design、stack、tasks 和获批的长期文档；不创建 change 或实现代码。缺 flow docs 或 proposal 时停止，提示用户显式运行 `/setup-skills` 或 `/to-spec`；行为契约需变更时报告冲突并停止。

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
- 相关现有 `docs/architecture/` 文档（如存在）
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

Step 3 的设计决定确认后，读取并执行 [references/write-design.md](references/write-design.md)。完成条件：`design.md` 符合项目模板，影响实现的决定均获确认，无未授权假设或占位符。

### 5. Decide whether to design the stack

根据已确认的 specs、`design.md` 和现有代码判断是否需要单独的实现落地文档，并说明依据。独立业务的单表常规 CRUD 通常跳过；多表、领域建模、设计模式、关键对外 interface、重构或数据迁移任一出现即触发。其他需要预先明确的重要实现约束也应触发，这些例子不是封闭清单。

需要时读取并执行 [references/design-stack.md](references/design-stack.md)；跳过时简述原因，不创建空文件。完成条件：判断有依据；需要的 `docs/architecture/<change-name>-stack.md` 已获确认，可用于拆分 tasks。

### 6. Write `tasks.md`

Step 5 的 stack 判断完成后，读取并执行 [references/write-tasks.md](references/write-tasks.md)；生成了 stack 文档时将其作为输入。完成条件：`tasks.md` 中每项均为合法 checkbox、可在单次 session 完成并验证，覆盖 proposal、specs、design 和适用的 stack 实现约束。

### 7. Confirm durable docs

`tasks.md` 确认后，读取并执行 [references/confirm-durable-docs.md](references/confirm-durable-docs.md)，处理 Step 3 暂存的候选。完成条件：长期文档只含获批的知识，与 specs 和 design 一致。

### 8. Verify and report

在目标 repository root 运行：

```bash
spect validate <change-name> --strict --no-interactive
```

由 `spect` 检查 `requires` 依赖、`generates` 输出、`implement.tracks` 的 `tasks.md`，以及 proposal 和 delta specs 章节结构。另检查：

- 每个 capability 有 delta spec，或合法使用 `skip_specs: true`；delta specs 已经 `/to-spec` 确认。
- 无模板注释、占位符或影响实现的 open question；durable docs diff 与批准内容一致；tasks 覆盖 proposal、specs、design 和适用的 stack 文档。

运行 `git diff --check`；通过后运行 `spect status --change <change-name> --json` 确认 `isPlanningComplete: true`。报告 change name、artifact 路径、stack 判断、durable docs 和结果。失败时保留获批 artifacts，报告失败项及安全的继续位置。

## Handoff Next Step

下一步由用户显式运行 `/implement <change-name>` 执行实现。
