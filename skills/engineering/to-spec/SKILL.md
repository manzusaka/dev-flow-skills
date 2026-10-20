---
name: to-spec
description: 创建 OpenSpec change 的 proposal.md 与 delta specs，确认行为契约后交给 to-plan。
disable-model-invocation: true
---

# To Spec

将当前对话已确认的行为写入新 OpenSpec change 的 `proposal.md` 和 delta specs；`design.md`、`tasks.md` 留给 `/to-plan`。

## Process

### 1. Check flow docs

仅支持 `/setup-skills` 产出的默认 spec-driven 脚手架，不支持 custom schema。在项目根目录检查：

- `openspec/config.yaml`
- `openspec/schemas/schema.yaml`
- `openspec/schemas/templates/proposal.md`
- `openspec/specs/`
- `openspec/changes/`

任一项缺失则停止，列出缺失项并提示用户显式运行 `/setup-skills`；本 skill 不初始化或修补脚手架。完成条件：各项存在，且已确定 `openspec/config.yaml` 配置的 schema。

### 2. Gather context

使用当前对话已确定的内容；仅当影响 spec 的需求信息缺失时提问，获得明确答案后继续。以下上下文文件存在则读，不存在则跳过且不警告：

- `CONTEXT.md` 的领域词汇和业务规则；`CONTEXT-MAP.md` 指向的相关 context（只读）
- 相关产品 PRD 的当前版本；多个合理候选须由用户确认，旧版不作当前需求依据
- 相关 `docs/adr/` records
- `openspec/config.yaml`
- `openspec/specs/` 中相关的现有 capabilities
- `openspec/changes/` 中除 `archive/` 外可能重叠的 active changes
- 与变更相关的代码、测试和模块边界
- `openspec/schemas/templates/proposal.md`

现有 capability 用精确路径；新增路径用 kebab-case 并遵循现有组织方式。当前 PRD 是产品需求依据，现有 spec 用于确定 delta，差异不要求修订历史 spec。用户指定 FR 时，仅纳入该功能及必要依赖。与现行 ADR 或 active change 冲突时列出双方位置供用户决定；ADR 未更新或冲突未解决前停止创建。

完成条件：问题、范围、capabilities、约束和代码现状均可追溯到对话或仓库事实。

### 3. Create the change

根据已确定内容选简短的 kebab-case `<change-name>`。目标结构：

```text
openspec/changes/<change-name>/
├── .openspec.yaml
├── proposal.md
└── specs/
    └── <capability-path>/spec.md
```

先运行 `spect --version`；若 command not found，调用 `/init-cli`，安装完成前不创建 change。

在项目根目录运行：

```bash
spect new change <change-name>
```

不附加 `--description`、`--schema` 等参数；schema 来自 `openspec/config.yaml`。命令生成含 `schema`、`created` 的 `.openspec.yaml`。同名 change 已存在时停止并另选名称，不修改已有 change。

仅当对话已明确是无 spec-level behavior 变化的纯重构、工具链或文档变更时，在 `.openspec.yaml` 追加：

```yaml
skip_specs: true
```

行为变化须在 proposal 声明至少一个 new 或 modified capability，不使用 `skip_specs`。完成条件：目录与元数据已创建，schema 与项目配置一致。

### 4. Write `proposal.md`

严格按项目 `openspec/schemas/templates/proposal.md` 的 heading 顺序和字段写入，移除注释及占位符。保留英文 Markdown headings；正文、字段、故事标题和 capability 描述用中文，路径、标识符、命令和代码保留原样。

- `Why` 记录变更动机和当前时机。
- `User story` 为每个已知业务场景分配稳定的 `US-NNN`，保留类型、场景/约束、图片/原型、图片说明和验收标准；无图片或原型写“无”。
- `Capabilities` 区分 new 与 modified；modified 用现有路径。纯技术 change 的两个列表均写“无”，与 `skip_specs: true` 一致。
- `Impact` 记录受影响的代码、API、依赖或系统，不写实现步骤。

不发明 requirement、capability 或实现决定。展示 proposal 草稿及来源映射，获用户确认后才写入；此阶段不写 design、tasks 或 delta specs。完成条件：所有断言有来源，无模板残留，Capabilities 与 `skip_specs` 状态一致。

### 5. Write delta specs

运行 `spect status --change <change-name> --json` 和 `spect templates --json` 获取输出路径与模板，再运行 `spect instructions specs --change <change-name>`；按其依赖清单重读磁盘文件，遵循返回的路径和内容规则。除 `skip_specs: true` 外，每个 New 或 Modified Capability 写一个 delta spec。

- New 使用 proposal 的精确路径，按模板写 Purpose、requirements 和可验证 scenarios。
- Modified 使用现有路径；先读 `openspec/specs/<capability-path>/spec.md`，复制完整 requirement block 再修改，保留未变内容。
- 只写可观察行为；保留英文 Markdown headings 和 `FROM:` / `TO:` 标记，规范正文与场景步骤用中文，遵守 schema 格式。

展示全部草稿及来源映射，获用户确认后才写入。需求不足或与现行 ADR、active change 冲突时列出来源供用户决定，不推测行为；与 canonical spec 的差异由 delta spec 表达。`skip_specs: true` 时确认 proposal 无行为变化且目录中无 delta spec。

完成条件：每个 proposal capability 恰有一个 delta spec，或合法使用 `skip_specs: true`；草稿获批，文件无占位符。

### 6. Verify and report

检查 `.openspec.yaml` 与 `proposal.md` 同在 change 目录，change name 和新 capability path 为 kebab-case，proposal headings 与模板一致，capabilities 与 delta specs 一一对应或合法跳过，且未改范围外 OpenSpec artifacts。运行 `spect status --change <change-name> --json` 确认识别 change 与 specs，再运行 `git diff --check`；完整的 `spect validate --strict` 留给 `/to-plan`。

报告 change name、路径、schema、capabilities 和验证结果。

## Handoff Next Step

下一步由用户显式运行 `/to-plan <change-name>` 编写 design 与 tasks。
