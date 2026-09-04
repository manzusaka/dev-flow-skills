---
name: to-plan
description: 读取 `/to-spec` 创建的 OpenSpec change，补齐 delta specs、design.md 与 tasks.md，并在最终验证前确认领域词汇和 ADR 更新。
disable-model-invocation: true
---

# To Plan

把一个已经存在的 OpenSpec proposal 推进为可执行的 planning artifacts：delta specs、`design.md` 和 `tasks.md`。调用形式是 `/to-plan [change-name]`。

本 skill 的边界：

- 不创建 change，也不实现项目代码；完成后停止。
- 只授权写入 planning artifacts 和经用户批准的 durable docs。
- 缺少 flow docs 或 proposal 时停止，让用户显式运行 `/setup-skills` 或 `/to-spec`。

## Process

### 1. Resolve the change

先运行 `spect --version` 确认 CLI 可用；报 command not found 时调用 `/init-cli` 安装 `spect`，安装完成前不继续。

在目标 repository root 运行：

```bash
spect list --json
```

命令列出 `openspec/changes/` 下的 active changes（不含 `archive/` 与隐藏目录），输出 `changes + root` JSON shape，含名称、任务完成度和状态。本流程的 change discovery、artifact resolution 和 validation 都通过 `spect` 完成。

- 传入 `change-name` 且存在 exact directory match 时，直接选择。
- 把 invocation 中 change name 后的剩余文本视为一个完整 query。Normalized matching 将 query 转为小写，把空格与下划线替换为连字符，并折叠重复连字符；然后依次检查 normalized exact、prefix、substring 和 fuzzy match。需要 semantic matching 时读取候选的 `proposal.md` 摘要。
- 没有 exact match 时，按上述相关度而不是列表顺序排列全部合理候选，展示名称、匹配理由和 proposal 摘要，让用户确认，不静默选择近似结果。
- 未传参数时，展示全部 active changes 并让用户选择。
- 没有 active change 时停止；本 skill 不创建 change。

完成条件：用户已确认唯一的 `<change-name>`，目标目录是 `openspec/changes/<change-name>/`。

### 2. Check the artifact contract

在目标 repository root 运行：

```bash
spect status --change <change-name> --json
spect templates --json
```

`spect status` 输出 artifact graph 的当前状态：每个 artifact 的 `outputPath`、`resolvedOutputPath`、`existingOutputPaths`、`isPlanningComplete` 与 `applyRequires`；config 与 schema 的一致性、依赖顺序和输出位置由 `spect` 解析，不手工读取。`spect templates` 输出 proposal、specs、design、tasks 的已解析模板路径。

在此基础上读取并验证：

- `CONTEXT.md` 或 `CONTEXT-MAP.md` 指向的相关 context
- 相关 `docs/adr/` 和 context-scoped ADRs
- change 中的 `.openspec.yaml` 与 `proposal.md`
- proposal 声明的现有 capability specs、相关代码和测试

本流程要求当前 schema 生成 `specs/**/*.md`、`design.md` 和 `tasks.md`，并以 `tasks.md` 作为 apply tracking artifact；目标项目的 `openspec/` 文件是 single source of truth。

如果 `spect status` 报告错误、必要文件缺失或 proposal 留有会改变行为的未决项，停止并准确报告缺口。已有 delta specs、`design.md` 或 `tasks.md` 时（`existingOutputPaths` 非空），展示现状并让用户确认是继续完善还是替换；未经确认不覆盖。

完成条件：proposal、schema、templates、capabilities 和已有 artifacts 已盘点，下一次写入的文件集合已获用户确认。

### 3. Draft delta specs

除非 `.openspec.yaml` 明确设置 `skip_specs: true`，为 proposal 中每个 New 或 Modified Capability 生成对应 delta spec：

运行 `spect instructions specs --change <change-name>`，把输出的依赖清单、写入路径与内容规则作为本阶段契约；指令文本是约束，不复制进 artifact。

- 使用 proposal 中声明的精确 capability path。
- New Capability 使用目标 spec template，写出 Purpose、requirements 和可验证 scenarios。
- Modified Capability 先读取 `openspec/specs/<capability-path>/spec.md`，复制完整 requirement block 后再修改；保留未改变的内容。
- Specs 只描述 observable behavior。架构选型与执行步骤分别留给 design 和 tasks。

生成前按 `spect instructions` 输出的依赖清单从磁盘重新读取相关文件。先展示所有 delta spec 草稿及其来源映射，让用户确认后再写入。需求信息不足或与现有 spec、ADR、active change 冲突时，先解决冲突，不用猜测补齐。写入后运行 `spect status --change <change-name> --json` 确认输出已登记，并查看解锁的下一步。

完成条件：每个 proposal capability 都有且只有一个对应 delta spec，或 change 合法使用 `skip_specs: true`；所有写入内容已获批准且没有模板占位符。

### 4. Grill the design

围绕 proposal、confirmed specs、代码现状、测试 seams、domain docs 和 ADRs 运行一次完整的 `/grilling` session。持续遍历 design tree，直到所有会改变方案或任务拆分的 decisions 都已解决，并由用户明确确认共同理解已经达成。

探索环境事实是 agent 的工作；架构和设计取舍交给用户决定。讨论至少覆盖实际相关的模块边界、数据流、兼容性、迁移/回滚、安全、性能和测试策略，不为不相关的类别发明工作。

在 conversation 中暂存两类 durable-doc candidates，此时不写文件：

- 项目特有、已经解决的 canonical domain terms
- 同时满足 hard to reverse、surprising without context、real trade-off 的 ADR decisions

完成条件：design tree frontier 为空，用户确认讨论充分，且 durable-doc candidates 已明确列出。

### 5. Write `design.md`

严格使用目标项目的 design template。即使 change 很小也生成精简的 `design.md`，但不为填满模板发明 decision。

运行 `spect instructions design --change <change-name>`，按其依赖清单重新从磁盘读取相关文件。即使 schema instruction 把 design 标为 conditional，本 workflow 仍按用户确认始终创建精简 design。

- Context 只记录理解方案所需的现状和约束，动机引用 proposal。
- Goals / Non-Goals 只补充设计边界。
- Decisions 记录确认的方案、理由和真实备选方案。
- Risks / Trade-offs 记录风险及缓解方式。
- Migration Plan 只在适用时出现。
- Open Questions 只能保留不会改变 specs、方案或 tasks 的未知项。

先展示完整草稿，让用户确认后写入；写入后运行 `spect status --change <change-name> --json` 确认输出已登记，并查看解锁的下一步。

完成条件：`design.md` 符合目标 template，所有会影响实现的 decision 都已确认，且没有未授权的假设或占位符。

### 6. Write `tasks.md`

严格使用目标项目的 tasks template 和 checkbox 格式。每个 `## N. ...` group 是一个 tracer-bullet vertical slice：贯穿交付该 observable behavior 所涉及的全部层，可独立验证，并适合一个 fresh context window。

运行 `spect instructions tasks --change <change-name>`，按其依赖清单重新从磁盘读取 proposal、specs、design 等文件。

- 每项使用 `- [ ] N.M ...`。
- 按真实依赖顺序排列 groups 和 tasks；标准模板不增加 `Blocked by` 字段。
- 每项说明可验证的完成结果，不写无法独立判断的工作。
- 必要的 prefactoring 放在其解锁的 slice 之前。
- Wide refactor 使用 expand → migrate batches → contract；只有无法独立保持 green 时才增加最终 integrate-and-verify task。

展示完整计划，询问 vertical slices、粒度、顺序和验证方式是否正确；迭代到用户批准后再写入。写入后运行 `spect status --change <change-name> --json` 确认 planning 完成状态。

完成条件：每个 task 都是合法 checkbox、可在单次 session 内完成且可验证；所有 proposal stories、spec requirements 和 confirmed design decisions 都被覆盖。

### 7. Confirm durable docs

使用 `/domain-modeling` 的内容边界和格式处理 Step 4 暂存的 candidates：

- `CONTEXT.md` 只补充项目特有的 canonical terms；不写业务行为、spec、实现细节或设计摘要。
- 只为同时满足三项门槛的 decisions 创建 ADR；change-specific decisions 只保留在 `design.md`。
- 新 ADR 引用相关 OpenSpec change；需要时在 `design.md` 中补充 ADR reference，避免复制两份完整论证。

先展示 `CONTEXT.md`、ADR 和必要的 `design.md` proposed diffs。用户确认后才写入；没有合格 candidate 时不创建空文件。

完成条件：durable docs 只包含用户批准的长期知识，且与 specs 和 design 不矛盾。

### 8. Verify and report

在目标 repository root 运行：

```bash
spect validate <change-name> --strict --no-interactive
```

结构验证交给 `spect`：按 `requires` 检查依赖闭包，按 `generates` 检查输出存在，按 `apply.tracks` 检查 `tasks.md`，并校验 proposal 与 delta specs 的章节结构。

在结构验证之外补充语义检查：

- proposal 中每个 capability 都由 delta spec 覆盖，或 `skip_specs: true` 合法生效。
- artifacts 中没有未完成的 template comments、占位符或会影响实施的 open question。
- durable docs 的 diff 与用户批准内容一致。

最后运行 `git diff --check`，报告 change name、生成或更新的 artifact paths、durable docs 和验证结果。

完成条件：所有检查通过；失败时保留已批准的 artifacts，准确报告失败项和安全的继续位置。
