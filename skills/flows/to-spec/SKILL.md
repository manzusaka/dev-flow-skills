---
name: to-spec
description: 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 proposal.md；不重新访谈，只综合已经讨论过的内容。
disable-model-invocation: true
---

# To Spec

把当前 conversation 中已经确定的内容固化为一个 OpenSpec change。这个 skill 只创建变更目录、`.openspec.yaml` 和 `proposal.md`；`design.md`、`tasks.md` 与 delta specs 留给后续 OpenSpec 流程。

## Process

### 1. Check flow docs

在目标 repository root 检查以下内容：

- `CONTEXT.md`
- `docs/adr/`
- `openspec/config.yaml`
- `openspec/schemas/schema.yaml`
- `openspec/schemas/templates/proposal.md`
- `openspec/specs/`
- `openspec/changes/`

任一项缺失时停止，列出缺失项，并提示用户显式运行 `/init-flow-docs`。不要在本 skill 中代替用户初始化或修补这些文件。

完成条件：以上内容均存在，且 `openspec/config.yaml` 中配置的 schema 已确定。

### 2. Gather context

只综合当前 conversation 已经确定的内容，不重新进行需求访谈。

读取：

- `CONTEXT.md` 中的 domain vocabulary 与业务规则
- 与变更范围相关的 `docs/adr/` records
- `openspec/config.yaml`
- `openspec/specs/` 中相关的现有 capabilities
- `openspec/changes/` 中除 `archive/` 外可能重叠的 active changes
- 与变更相关的代码、测试和模块边界
- `openspec/schemas/templates/proposal.md`

使用现有 capability 的精确路径；新 capability path 使用 kebab-case，并遵循 `openspec/specs/` 已有的组织方式。发现与 ADR、现有 spec 或 active change 冲突时，先向用户指出，不能静默覆盖。

完成条件：problem、change scope、受影响 capabilities、相关约束和代码现状都能追溯到 conversation 或 repository 中的事实。

### 3. Agree test seams

草拟这次变更的测试 seams。优先使用现有 seam 和最高层的 public boundary；seams 越少越好，理想数量是一个。

向用户展示每个建议 seam，以及它能观察到的 external behavior。让用户确认后再继续；未确认时不创建 change。

完成条件：用户已明确确认 proposal 中要记录的测试 seams。

### 4. Create the change

从已确定的内容推导一个简短的 kebab-case `<change-name>`，目标结构是：

```text
openspec/changes/<change-name>/
├── .openspec.yaml
└── proposal.md
```

先运行 `spect --version` 确认 CLI 可用；报 command not found 时调用 `/init-cli` 安装 `spect`，安装完成前不创建 change。

在目标 repository root 运行：

```bash
spect new change <change-name>
```

不要附加 `--description`、`--schema` 等参数；schema 跟随 `openspec/config.yaml` 中的配置。

命令会创建 change 目录并写入 `.openspec.yaml`（`schema` 与 `created` 字段）。

如果命令报告同名 change 已存在，向用户展示它并确认是继续现有 change 还是使用新名称；不要覆盖。

只有当 conversation 已明确这是不改变 spec-level behavior 的纯重构、工具链或文档变更时，才在 `.openspec.yaml` 中追加：

```yaml
skip_specs: true
```

行为发生变化的 change 必须在 proposal 中声明至少一个 new 或 modified capability，不得使用 `skip_specs`。

完成条件：change 目录是新的或经用户确认继续使用，元数据 schema 与项目配置一致。

### 5. Write `proposal.md`

严格使用目标项目的 `openspec/schemas/templates/proposal.md`，按其 heading 顺序和字段结构，将注释与占位符替换成已经确定的内容：

- `Why` 记录变更动机和当前时机。
- `User story` 为每个已知业务场景分配稳定的 `US-NNN`，保留类型、场景/约束、图片/原型、图片说明和验收标准字段；没有图片或原型时明确写“无”。
- `Capabilities` 区分 new 与 modified。Modified 使用现有 capability 的精确路径；纯技术 change 的两个列表都写“无”，并与 `skip_specs: true` 保持一致。
- `Testing` 按 user story 列出可验证的测试点，并记录用户确认的 seams。只描述 external behavior。
- `Impact` 记录受影响的代码区域、API、依赖或系统，不写逐步实现方案。

不要为了填满模板而发明 requirement、capability 或 implementation decision。不要创建 `design.md`、`tasks.md` 或 `specs/` 下的文件。

完成条件：proposal 中每项断言都有来源，模板没有残留注释或占位符，Capabilities 与 `.openspec.yaml` 的 `skip_specs` 状态一致。

### 6. Verify and report

确认：

- `.openspec.yaml` 和 `proposal.md` 位于同一个 `openspec/changes/<change-name>/` 中。
- change name 与新增 capability path 符合 kebab-case。
- proposal 的 headings 与 `openspec/schemas/templates/proposal.md` 一致。
- 没有创建本 skill 范围外的 OpenSpec artifacts。

运行 `spect status --change <change-name>` 检查 OpenSpec 能识别该 change。

向用户报告 change name、生成路径、schema、capabilities 和已确认 seams，并说明 proposal 已就绪；下一步由用户显式运行 `/to-tickets <change-name>` 补齐 specs、design 和 tasks。
