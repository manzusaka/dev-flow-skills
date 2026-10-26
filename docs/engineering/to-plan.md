## What it does

`to-plan` 读取 `/to-spec` 已确认的 proposal 与 delta specs，编写 `design.md`、按需生成 stack 实现文档和 `tasks.md`。这次调用止于 planning 和获批的 durable docs，不实现项目代码。

```text
proposal.md + delta specs → architecture grilling → design.md → stack 判断与按需设计 → tasks.md
```

它不创建 change；最终的执行计划遵守 OpenSpec schema，写入 `tasks.md`。

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

选中的 change 必须已经由 `/to-spec` 创建 `.openspec.yaml`、`proposal.md` 和对应的 delta specs；`skip_specs: true` 时无需 delta specs。缺少前置产物时，`to-plan` 停止并报告缺口。已有 design 或 tasks 时也停止，不复核或覆盖已有计划。

整个流程依赖 `spect` CLI：change discovery 用 `spect list`，artifact graph 用 `spect status`，各阶段指令用 `spect instructions`，最终验证用 `spect validate`。命令缺失时经用户确认由 `/init-cli` 安装。

## Behavior contract

Proposal 的 Capabilities 是已确认的行为契约。`to-plan` 检查每个 New 或 Modified Capability 都有且只有一个使用精确 capability path 的 delta spec：

- New Capability 写 Purpose、requirements 和 scenarios。
- Modified Capability 从 canonical spec 复制完整 requirement block 后修改。
- Specs 只记录 observable behavior，不携带架构方案或执行步骤。

纯重构、工具链或文档 change 只有在 `.openspec.yaml` 已明确设置 `skip_specs: true` 时才跳过 specs。当前 PRD、现行 ADR 与本次 change 的决定不一致时，`to-plan` 列出双方准确位置并停止，由用户决定后续处理。

## Architecture grilling and design

Specs 确认后，skill 围绕代码、测试 seams、domain docs、ADRs 和 change 运行一次完整 `/grilling` session。它不是固定一轮问答：design tree 会持续推进，直到所有会改变方案或 tasks 的问题都解决，用户确认共同理解已经达成。

之后严格使用目标项目模板生成 `design.md`。每个 change 都生成 design；简单 change 可以很短，但不能为了填模板发明 decision。只有不会改变 specs、方案或 tasks 的问题才能留在 Open Questions。

写完 design 后，agent 根据 specs、design 和代码判断是否需要单独的 stack 实现文档。独立业务的单表常规 CRUD 通常跳过；多表、领域建模、设计模式、关键对外 interface、重构或数据迁移任一出现即触发。其他需要提前明确的数据一致性、跨系统集成、并发与失败处理、安全、兼容性、性能、可观测性或发布迁移实现也会触发。这是 `/to-plan` 内的条件分支：需要时说明已确认方案如何落到代码、数据和运行环境，展示草稿并获确认后写入 `docs/architecture/<change-name>-stack.md`，再据此编排 tasks；跳过时说明原因。

## `tasks.md` as tracer bullets

计划使用已确认的 specs、design 和适用的 stack 文档，采用标准 OpenSpec checkbox 格式：

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
- Change-specific decisions 留在 `design.md`；stack 文档说明已确认方案的实现落点。

Skill 会展示 proposed diffs；用户确认后才写入。没有合格内容时，不创建空 ADR 或 glossary 条目。

## Approval boundaries

写入分以下独立 checkpoint：

1. `design.md` 草稿
2. 需要时的 stack 实现文档草稿
3. `tasks.md` 草稿
4. `CONTEXT.md` / ADR proposed diffs

本 skill 不覆盖已有 artifact。每个 checkpoint 都允许用户修改或停止，后续 artifact 只建立在已经确认的前置 artifact 上。

## Verification

完成时运行 `spect validate <change-name> --strict --no-interactive`：依赖闭包、输出存在、`tasks.md` checkbox 追踪与章节结构由 `spect` 检查。语义检查补充：

- Proposal capabilities 与 delta specs 一一对应，或 `skip_specs` 合法生效。
- `design.md` 没有会影响实现的未决问题。
- 需要 stack 时，该文档与 specs、design 一致，tasks 覆盖其实现约束。
- `tasks.md` 中每项都是 OpenSpec 可追踪的 checkbox、可验证且适合单次 session。
- Durable docs 只包含用户批准的长期知识。
- `git diff --check` 通过。

验证通过后用 `spect status` 确认 planning 完成。

## Where it fits

```text
grill-with-docs → to-spec → to-plan → implement → code-review
```

`to-spec` 固化 WHY 和 WHAT；`to-plan` 补齐 HOW 和 implementation plan；`implement` 按 `tasks.md` 中的 vertical slices 推进实现；`code-review` 用 OpenSpec artifacts 检查实现是否符合要求。收尾时 `to-plan` 以 `Handoff Next Step` 章节提示下一步：由用户显式运行 `/implement <change-name>`。
