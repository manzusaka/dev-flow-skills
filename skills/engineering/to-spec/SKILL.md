---
name: to-spec
description: 创建 OpenSpec change 的 proposal.md 与 delta specs，确认行为契约后交给 to-plan。
disable-model-invocation: true
---

# To Spec

把当前 conversation 中已经确定的行为固化为新 OpenSpec change 的 `proposal.md` 与 delta specs。使用 `/to-spec` 创建 change；`design.md` 与 `tasks.md` 由 `/to-plan` 处理。

## Process

### 1. Check flow docs

本 skill 只支持 `/setup-skills` 产出的默认 spec-driven 脚手架；custom schema 仓库不在支持范围。

在目标 repository root 检查以下 OpenSpec 脚手架项：

- `openspec/config.yaml`
- `openspec/schemas/schema.yaml`
- `openspec/schemas/templates/proposal.md`
- `openspec/specs/`
- `openspec/changes/`

任一项缺失时停止，列出缺失项，并提示用户显式运行 `/setup-skills`。不要在本 skill 中代替用户初始化或修补这些文件。

完成条件：以上内容均存在，且 `openspec/config.yaml` 中配置的 schema 已确定。

### 2. Gather context

综合当前 conversation 已经确定的内容。只有缺少会影响 spec 的需求信息时，针对缺口向用户提问，取得明确答案后继续。

上下文文档存在则读取，不存在则跳过，不是阻塞项，也不警告。读取：

- `CONTEXT.md` 中的 domain vocabulary 与业务规则（如存在）
- `CONTEXT-MAP.md` 指向的、与变更范围相关的 context（如存在，multi-context 仓库；只读）
- 相关产品 PRD 的当前版本（如存在）；有多个合理候选时让用户确认，不读取旧版本作为本次需求依据
- 与变更范围相关的 `docs/adr/` records（如存在）
- `openspec/config.yaml`
- `openspec/specs/` 中相关的现有 capabilities
- `openspec/changes/` 中除 `archive/` 外可能重叠的 active changes
- 与变更相关的代码、测试和模块边界
- `openspec/schemas/templates/proposal.md`

使用现有 capability 的精确路径；新 capability path 使用 kebab-case，并遵循 `openspec/specs/` 已有的组织方式。当前 PRD 是产品需求依据，现有 spec 用于确定 delta；两者行为不同不要求修订历史 spec。用户指定某个 FR 时，只将该功能及必要依赖纳入本次 change。发现与现行 ADR 或 active change 冲突时，列出双方位置并请用户决定；ADR 决定尚未更新或 change 冲突尚未解决时停止创建，不静默覆盖。

完成条件：problem、change scope、受影响 capabilities、相关约束和代码现状都能追溯到 conversation 或 repository 中的事实。

### 3. Create the change

从已确定的内容推导一个简短的 kebab-case `<change-name>`。目标结构是：

```text
openspec/changes/<change-name>/
├── .openspec.yaml
├── proposal.md
└── specs/
    └── <capability-path>/spec.md
```

先运行 `spect --version` 确认 CLI 可用；报 command not found 时调用 `/init-cli` 安装 `spect`，安装完成前不创建 change。

在目标 repository root 运行：

```bash
spect new change <change-name>
```

不要附加 `--description`、`--schema` 等参数；schema 跟随 `openspec/config.yaml` 中的配置。

命令会创建 change 目录并写入 `.openspec.yaml`（`schema` 与 `created` 字段）。

如果命令报告同名 change 已存在，停止并为新 change 确定其他名称；本 skill 不修改已有 change。

只有当 conversation 已明确这是不改变 spec-level behavior 的纯重构、工具链或文档变更时，才在 `.openspec.yaml` 中追加：

```yaml
skip_specs: true
```

行为发生变化的 change 必须在 proposal 中声明至少一个 new 或 modified capability，不得使用 `skip_specs`。

完成条件：新 change 的目录与元数据已创建，schema 与项目配置一致。

### 4. Write `proposal.md`

严格使用目标项目的 `openspec/schemas/templates/proposal.md`，按其 heading 顺序和字段结构，将注释与占位符替换成已经确定的内容：

保留模板中的英文 Markdown headings；heading 下的正文、字段内容、故事标题和 capability 描述使用中文。路径、标识符、命令和代码保持其原始形式。

- `Why` 记录变更动机和当前时机。
- `User story` 为每个已知业务场景分配稳定的 `US-NNN`，保留类型、场景/约束、图片/原型、图片说明和验收标准字段；没有图片或原型时明确写“无”。
- `Capabilities` 区分 new 与 modified。Modified 使用现有 capability 的精确路径；纯技术 change 的两个列表都写“无”，并与 `skip_specs: true` 保持一致。
- `Impact` 记录受影响的代码区域、API、依赖或系统，不写逐步实现方案。

不要为了填满模板而发明 requirement、capability 或 implementation decision。先展示 proposal 草稿及来源映射，取得用户确认后才写入。此阶段不写 design、tasks 或 delta specs。

完成条件：proposal 中每项断言都有来源，模板没有残留注释或占位符，Capabilities 与 `.openspec.yaml` 的 `skip_specs` 状态一致。

### 5. Write delta specs

运行 `spect status --change <change-name> --json` 与 `spect templates --json`，读取已解析的输出路径和目标模板。除非 `.openspec.yaml` 明确设置 `skip_specs: true`，为 proposal 中每个 New 或 Modified Capability 编写一个 delta spec。运行 `spect instructions specs --change <change-name>`，按其依赖清单重新读取磁盘文件，并以输出的路径和内容规则为准。

- New Capability 使用 proposal 中的精确路径，按模板编写 Purpose、requirements 与可验证 scenarios。
- Modified Capability 使用现有 capability 的精确路径；先读取 `openspec/specs/<capability-path>/spec.md`，复制完整 requirement block 后修改，保留未改变的内容。
- 只写可观察行为。保留模板的英文 Markdown headings、`FROM:` / `TO:` 标记；规范性正文和场景步骤使用中文，遵守 schema 的格式规则。

先展示全部 delta spec 草稿和来源映射。用户确认后才写入。需求不足或与现行 ADR、active change 冲突时先列出来源并请用户决定，不推测行为；与 canonical spec 的行为差异由 delta spec 表达。`skip_specs: true` 时确认 proposal 没有行为变更，且 change 下没有 delta spec 文件。

完成条件：每个 proposal capability 恰好对应一个 delta spec，或合法使用 `skip_specs: true`；草稿已获确认，文件无模板占位符。

### 6. Verify and report

确认：

- `.openspec.yaml` 和 `proposal.md` 位于同一个 `openspec/changes/<change-name>/` 中。
- change name 与新增 capability path 符合 kebab-case。
- proposal 的 headings 与 `openspec/schemas/templates/proposal.md` 一致。
- proposal capabilities 与 delta specs 一一对应，或 `skip_specs: true` 合法生效。
- 没有修改本 skill 范围外的 OpenSpec artifacts。

运行 `spect status --change <change-name> --json` 检查 OpenSpec 能识别该 change 与 specs；运行 `git diff --check`。完整的 `spect validate --strict` 留待 design 与 tasks 齐全后由 `/to-plan` 执行。

向用户报告 change name、生成的路径、schema、capabilities 和验证结果。

## Handoff Next Step

下一步由用户显式运行 `/to-plan <change-name>` 编写 design 与 tasks。
