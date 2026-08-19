## What it does

`to-tickets` 读取 `/to-spec` 创建的 OpenSpec change，把已有 `proposal.md` 推进为完整的 planning artifacts：delta specs、`design.md` 和 `tasks.md`。这次调用止于 planning 和获批的 durable docs，不实现项目代码。

```text
proposal.md → delta specs → architecture grilling → design.md → tasks.md
```

它不再读取或发布 issue tracker tickets。名字保留下来，但最终的执行计划遵守 OpenSpec schema，写入 `tasks.md`。

## Invocation and change selection

显式调用：

```text
/to-tickets <change-name>
```

Exact match 会直接选择 `openspec/changes/<change-name>/`。参数没有 exact match 时，skill 使用自带脚本列出所有未归档 changes，再结合名称和 proposal 内容给出候选，由用户确认。没有参数时也先列出 active changes，让用户选择。

列表脚本直接扫描 `openspec/changes/`，排除 `archive/` 和隐藏目录，输出 OpenSpec change list 使用的 `changes + root` JSON shape。`completedTasks`、`totalTasks` 和 `status` 来自 `tasks.md` checkboxes。

## Prerequisites

目标仓库必须先通过 `/init-flow-docs` 建立：

- `CONTEXT.md` 或 `CONTEXT-MAP.md`
- ADR 目录
- OpenSpec config、schema 和 artifact templates
- `openspec/specs/` 与 `openspec/changes/`

选中的 change 必须已经由 `/to-spec` 创建 `.openspec.yaml` 和 `proposal.md`。缺少前置产物时，`to-tickets` 停止并让用户显式调用对应 skill；它不会自行创建 change 或初始化 flow docs。

整个流程不依赖 OpenSpec CLI。Skill 直接读取 config、schema、templates 和 change files，从 schema 的 `requires`、`generates`、`instruction` 与 `apply.tracks` 解析 artifact graph、写入位置和格式。

## Delta specs

Proposal 的 Capabilities 是 specs 阶段的 contract。每个 New 或 Modified Capability 都生成一个使用精确 capability path 的 delta spec：

- New Capability 写 Purpose、requirements 和 scenarios。
- Modified Capability 从 canonical spec 复制完整 requirement block 后修改。
- Specs 只记录 observable behavior，不携带架构方案或执行步骤。

纯重构、工具链或文档 change 只有在 `.openspec.yaml` 已明确设置 `skip_specs: true` 时才跳过 specs。所有草稿先交给用户确认，再写入 change。

## Architecture grilling and design

Specs 确认后，skill 围绕代码、测试 seams、domain docs、ADRs 和 change 运行一次完整 `/grilling` session。它不是固定一轮问答：design tree 会持续推进，直到所有会改变方案或 tasks 的问题都解决，用户确认共同理解已经达成。

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

写入分四个独立 checkpoint：

1. Delta specs 草稿
2. `design.md` 草稿
3. `tasks.md` 草稿
4. `CONTEXT.md` / ADR proposed diffs

已有 artifact 不会被静默覆盖。每个 checkpoint 都允许用户修改或停止，后续 artifact 只建立在已经确认的前置 artifact 上。

## Verification

完成时直接对照 schema、templates 和 artifacts 做本地结构与内容验证。最终状态应满足：

- Proposal capabilities 与 delta specs 一一对应，或 `skip_specs` 合法生效。
- `design.md` 没有会影响实现的未决问题。
- `tasks.md` 中每项都是 OpenSpec 可追踪的 checkbox、可验证且适合单次 session。
- Durable docs 只包含用户批准的长期知识。
- `git diff --check` 通过。

## Where it fits

```text
grill-with-docs → to-spec → to-tickets → implement → code-review
```

`to-spec` 固化 WHY 和 WHAT 的入口；`to-tickets` 补齐 specs、HOW 和 implementation plan；`implement` 按 `tasks.md` 中的 vertical slices 推进实现；`code-review` 用 OpenSpec artifacts 检查实现是否符合要求。
