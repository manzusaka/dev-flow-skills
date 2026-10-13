## What it does

`to-spec` 把已经确定的 conversation 固化为 OpenSpec proposal 与 delta specs。它创建或修改 `.openspec.yaml`、`proposal.md` 和 change 下的 `specs/`；design 与 tasks 由 `to-plan` 处理。

```text
openspec/changes/<change-name>/
├── .openspec.yaml
├── proposal.md
└── specs/
    └── <capability-path>/spec.md
```

它综合已确定的事实；只有编写 spec 时发现会改变行为的缺口，才针对缺口追问。任何没有来源的 requirement 都不应被写入。

## When to reach for it

你通过输入 `/to-spec` 显式创建 change；修改未归档 change 时输入 `/to-spec <change-name>`，必须使用精确名称。

| 你在哪里 | 运行什么 |
| --- | --- |
| 还存在会改变范围或行为的未知项 | 先继续 grilling 或探索 |
| 已确定，准备记录为 OpenSpec change | `/to-spec` |
| 修改已有 proposal 或 delta specs | `/to-spec <change-name>` |
| Flow docs 尚未初始化 | 先显式运行 `/setup-skills` |

## Prerequisites

目标 repository 必须已经存在：

- `openspec/config.yaml`
- `openspec/schemas/schema.yaml`
- `openspec/schemas/templates/proposal.md`
- `openspec/specs/`
- `openspec/changes/`

任一 OpenSpec 脚手架项缺失时，`to-spec` 会停止并提示运行 `/setup-skills`；`CONTEXT.md`、相关 ADR 等上下文文档存在则读取。

## Flow

`to-spec` 先读取领域词汇、相关 ADR、OpenSpec 配置、现有 capabilities、活跃 changes，以及变更涉及的代码与测试。这样 proposal 使用现有 capability 的精确路径，也能在写入前暴露重复 change 或 ADR 冲突。

首次创建时，它推导 kebab-case change name，使用 `spect new change` 创建目录与元数据：

```yaml
schema: <openspec/config.yaml 中配置的 schema>
created: <YYYY-MM-DD>
```

纯重构、工具链或文档变更如果已经明确不改变 spec-level behavior，还会写入 `skip_specs: true`。行为发生变化的 change 必须声明 new 或 modified capability，不能使用这个标记。

## Proposal template

目标项目中的 `openspec/schemas/templates/proposal.md` 是 proposal 结构的 single source of truth；它由 `/setup-skills` 随本地 schema 一起安装：

- `Why`：为什么需要这次变更、为什么是现在。
- `User story`：稳定的 `US-NNN`、类型、场景与约束、原型信息、验收标准。
- `Capabilities`：new capability 使用符合项目布局的 kebab-case 路径；modified capability 使用 `openspec/specs/` 中的精确现有路径。
- `Impact`：受影响的代码区域、API、依赖或系统。

模板中的注释和占位符会被实际内容替换。没有图片或原型时明确写“无”；没有 spec-level behavior change 时 Capabilities 两个列表都写“无”，并由 `.openspec.yaml` 的 `skip_specs: true` 表达这是有意的零 delta change。

## Delta specs and revision

Proposal 草稿先确认，再按其中的 capability 列表确认 delta spec 草稿及来源映射。修改已有 change 时，先展示拟新增、修改、删除的文件清单；每个 capability 对应一个 delta spec，`skip_specs: true` 的纯技术 change 不创建 specs。

已有 `design.md` 或 `tasks.md` 时，若本次确认后的 proposal 或 delta specs 内容实际变化，`to-spec` 在 `.openspec.yaml` 写入 `planning_invalidated: true`。随后必须运行 `/to-plan <change-name>` 复核设计、任务和受影响的已完成任务；复核前 `spect` 阻止实施与归档。直接手工编辑文件不在这个自动标记范围内。

完整 change 最终包含：

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

其中 `design.md` 与 `tasks.md` 由 `/to-plan <change-name>` 创建或复核。

## It's working if

- 缺少 OpenSpec 脚手架时，它列出缺失项并停在 `/setup-skills` 提示处。
- Proposal 与 delta specs 分别展示草稿并取得确认。
- change name 与新增 capability paths 都是 kebab-case。
- Modified Capabilities 与 `openspec/specs/` 中的路径完全一致。
- `.openspec.yaml` 的 schema 与 `openspec/config.yaml` 一致。
- `proposal.md` 与 delta specs 没有模板注释、占位符或未决定的行为。
- Proposal 中每个 capability 都有对应的 delta spec，或合法使用 `skip_specs: true`。
- 本次调用没有创建或修改 `design.md`、`tasks.md`；已有计划因上游变化而失效时已标记。

## Where it fits

`to-spec` 是已确定 conversation 进入 OpenSpec planning 的入口：

```text
grill-with-docs → to-spec → to-plan → implement → code-review
```

它的上游负责确定需求；它负责确认 proposal 与 delta specs；`to-plan` 根据两者补齐或复核 design 和 tasks。收尾时它以 `Handoff Next Step` 章节提示用户显式运行 `/to-plan <change-name>`。
