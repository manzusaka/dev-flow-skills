## What it does

`to-plan` 读取 `/to-spec` 已确认的 proposal 与 delta specs，编写或复核 `design.md` 和 `tasks.md`。这次调用止于 planning 和获批的 durable docs，不实现项目代码。

```text
proposal.md + delta specs → architecture grilling → design.md → tasks.md
```

它不创建 change，也不发布 issue；最终的执行计划遵守 OpenSpec schema，写入 `tasks.md`。

## Invocation and change selection

显式调用：

```text
/to-plan <change-name>
```

Exact match 会直接选择 `openspec/changes/<change-name>/`。参数没有 exact match 时，skill 用 `spect list --json` 列出所有未归档 changes，再结合名称和 proposal 内容给出候选，由用户确认。没有参数时也先列出 active changes，让用户选择。

`spect list` 扫描 `openspec/changes/`，排除 `archive/` 和隐藏目录，输出 `changes + root` JSON shape。`completedTasks`、`totalTasks` 和 `status` 来自 `tasks.md` checkboxes。

## Prerequisites

目标仓库必须先通过 `/setup-skills` 建立：

- `CONTEXT.md` 或 `CONTEXT-MAP.md`
- ADR 目录
- OpenSpec config、schema 和 artifact templates
- `openspec/specs/` 与 `openspec/changes/`

选中的 change 必须已经由 `/to-spec` 创建 `.openspec.yaml`、`proposal.md` 和对应的 delta specs；`skip_specs: true` 时无需 delta specs。缺少前置产物时，`to-plan` 停止并提示重新从 `/to-spec <change-name>` 处理。

整个流程依赖 `spect` CLI：change discovery 用 `spect list`，artifact graph 用 `spect status`，各阶段指令用 `spect instructions`，最终验证用 `spect validate`。命令缺失时经用户确认由 `/init-cli` 安装。

## Behavior contract

Proposal 的 Capabilities 是已确认的行为契约。`to-plan` 检查每个 New 或 Modified Capability 都有且只有一个使用精确 capability path 的 delta spec：

- New Capability 写 Purpose、requirements 和 scenarios。
- Modified Capability 从 canonical spec 复制完整 requirement block 后修改。
- Specs 只记录 observable behavior，不携带架构方案或执行步骤。

纯重构、工具链或文档 change 只有在 `.openspec.yaml` 已明确设置 `skip_specs: true` 时才跳过 specs。行为需要改变时，交回用户显式运行 `/to-spec <change-name>`。

## Architecture grilling and design

Specs 确认后，skill 围绕代码、测试 seams、domain docs、ADRs 和 change 运行一次完整 `/grilling` session。它不是固定一轮问答：design tree 会持续推进，直到所有会改变方案或 tasks 的问题都解决，用户确认共同理解已经达成。

若 `.openspec.yaml` 标记 `planning_invalidated: true`，还要复核已有 design、tasks 和受影响的已勾选任务：不再满足新规格的任务取消勾选，缺少任务的新行为补充任务。

之后严格使用目标项目模板生成 `design.md`。每个 change 都生成 design；简单 change 可以很短，但不能为了填模板发明 decision。只有不会改变 specs、方案或 tasks 的问题才能留在 Open Questions。

## `tasks.md` as tracer bullets

计划使用标准 OpenSpec checkbox 格式：

```markdown
## 1. <vertical slice>

- [ ] 1.1 <可验证任务>
- [ ] 1.2 <可验证任务>
```

每个编号 group 是一个 tracer-bullet vertical slice，而不是 schema、API、UI、tests 这样的水平层。它贯穿交付该 behavior 所需的相关层，可独立验证，并适合一个 fresh context window。依赖通过 group 和 task 的排列顺序表达，不扩展模板加入 `Blocked by`。

Wide refactor 仍使用 expand → migrate batches → contract；必要时才增加最终 integrate-and-verify task。

## Durable docs

Grilling 中发现的长期知识先暂存在 conversation，等 specs、design 和 tasks 都确认后再处理：

- `CONTEXT.md` 只接收项目特有的 canonical domain terms。
- ADR 只记录难以逆转、缺少背景会令人意外、并且确有真实 trade-off 的 decisions。
- Change-specific decisions 留在 `design.md`。

Skill 会展示 proposed diffs；用户确认后才写入。没有合格内容时，不创建空 ADR 或 glossary 条目。

## Approval boundaries

写入分三个独立 checkpoint：

1. `design.md` 草稿
2. `tasks.md` 草稿
3. `CONTEXT.md` / ADR proposed diffs

已有 artifact 不会被静默覆盖。每个 checkpoint 都允许用户修改或停止，后续 artifact 只建立在已经确认的前置 artifact 上。

## Verification

完成时运行 `spect validate <change-name> --strict --no-interactive`：依赖闭包、输出存在、`tasks.md` checkbox 追踪与章节结构由 `spect` 检查。语义检查补充：

- Proposal capabilities 与 delta specs 一一对应，或 `skip_specs` 合法生效。
- `design.md` 没有会影响实现的未决问题。
- `tasks.md` 中每项都是 OpenSpec 可追踪的 checkbox、可验证且适合单次 session。
- Durable docs 只包含用户批准的长期知识。
- `git diff --check` 通过。

验证通过后清除 `planning_invalidated`，再用 `spect status` 确认 planning 完成；验证失败时保留标志，`/implement` 与 `spect archive` 继续被阻止。

## Where it fits

```text
grill-with-docs → to-spec → to-plan → implement → code-review
```

`to-spec` 固化 WHY 和 WHAT；`to-plan` 补齐 HOW 和 implementation plan；`implement` 按 `tasks.md` 中的 vertical slices 推进实现；`code-review` 用 OpenSpec artifacts 检查实现是否符合要求。收尾时 `to-plan` 以 `Handoff Next Step` 章节提示下一步：由用户显式运行 `/implement <change-name>`。
