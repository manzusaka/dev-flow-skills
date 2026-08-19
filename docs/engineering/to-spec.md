## What it does

`to-spec` 把已经确定的 conversation 固化为一个 OpenSpec change proposal。它直接创建兼容的 `.openspec.yaml` 与 `proposal.md`，不使用 issue tracker，也不生成后续的 design、tasks 或 delta specs。

```text
openspec/changes/<change-name>/
├── .openspec.yaml
└── proposal.md
```

它不会重新访谈你。Proposal 记录 thread、codebase、`CONTEXT.md`、ADRs 和现有 OpenSpec specs 中已经存在的事实；任何没有来源的 requirement 都不应被写入。

## When to reach for it

你通过输入 `/to-spec` 显式调用它。适合在需求和边界已经确定、准备进入 OpenSpec planning 时使用。

| 你在哪里 | 运行什么 |
| --- | --- |
| 还存在会改变范围或行为的未知项 | 先继续 grilling 或探索 |
| 已确定，准备记录为 OpenSpec change | `/to-spec` |
| Flow docs 尚未初始化 | 先显式运行 `/init-flow-docs` |

## Prerequisites

目标 repository 必须已经存在：

- `CONTEXT.md`
- `docs/adr/`
- `openspec/config.yaml`
- `openspec/schemas/schema.yaml`
- `openspec/schemas/templates/proposal.md`
- `openspec/specs/`
- `openspec/changes/`

任一项缺失时，`to-spec` 会停止并提示运行 `/init-flow-docs`。它不会自行初始化，因为 `/to-spec` 的职责是创建 change proposal，不是建立项目文档结构。

## Flow

`to-spec` 先读取领域词汇、相关 ADR、OpenSpec 配置、现有 capabilities、活跃 changes，以及变更涉及的代码与测试。这样 proposal 使用现有 capability 的精确路径，也能在写入前暴露重复 change 或 ADR 冲突。

在写文件前，它会提出最少数量、尽可能高层且优先复用现有 public boundary 的测试 seams。每个 seam 都附带它能观察的 external behavior；只有用户确认后才创建 change。

之后它推导 kebab-case change name，并直接写入：

```yaml
schema: <openspec/config.yaml 中配置的 schema>
created: <YYYY-MM-DD>
```

纯重构、工具链或文档变更如果已经明确不改变 spec-level behavior，还会写入 `skip_specs: true`。行为发生变化的 change 必须声明 new 或 modified capability，不能使用这个标记。

## Proposal template

目标项目中的 `openspec/schemas/templates/proposal.md` 是 proposal 结构的 single source of truth；它由 `/init-flow-docs` 随本地 schema 一起安装：

- `Why`：为什么需要这次变更、为什么是现在。
- `User story`：稳定的 `US-NNN`、类型、场景与约束、原型信息、验收标准。
- `Capabilities`：new capability 使用符合项目布局的 kebab-case 路径；modified capability 使用 `openspec/specs/` 中的精确现有路径。
- `Testing`：逐条 user story 的可验证测试点，以及用户确认的 test seams。
- `Impact`：受影响的代码区域、API、依赖或系统。

模板中的注释和占位符会被实际内容替换。没有图片或原型时明确写“无”；没有 spec-level behavior change 时 Capabilities 两个列表都写“无”，并由 `.openspec.yaml` 的 `skip_specs: true` 表达这是有意的零 delta change。

## Boundary

`to-spec` 在 proposal 就绪后停止。完整 change 最终可以继续包含：

```text
openspec/changes/<change-name>/
├── .openspec.yaml
├── proposal.md
├── design.md
├── tasks.md
└── specs/
    └── <capability-path>/
        └── spec.md
```

这些后续 artifacts 由 `/to-tickets <change-name>` 创建，不属于 `/to-spec` 本次调用的授权范围。

## It's working if

- 缺少 flow docs 时，它列出缺失项并停在 `/init-flow-docs` 提示处。
- 写 proposal 前，用户看到了 test seams 及其可观察行为并明确确认。
- change name 与新增 capability paths 都是 kebab-case。
- Modified Capabilities 与 `openspec/specs/` 中的路径完全一致。
- `.openspec.yaml` 的 schema 与 `openspec/config.yaml` 一致。
- `proposal.md` 没有模板注释、占位符或 conversation 中未决定的内容。
- 本次调用没有创建 `design.md`、`tasks.md` 或 delta specs。

## Where it fits

`to-spec` 是已确定 conversation 进入 OpenSpec planning 的入口：

```text
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它的上游负责确定需求；它负责创建 proposal；`to-tickets` 根据 proposal 补齐 delta specs、design 和 tasks。
