# Initialize flow docs

本 reference 只由 `/setup-skills` 使用。目标 repository root 已确定，兼容版本的 `spect` 已通过顶层 CLI 门禁。本阶段建立三类互补的事实来源：`CONTEXT.md` 保存领域词汇，`docs/adr/` 保存架构决策，`openspec/` 保存当前行为与尚未完成的变更。

只初始化结构；不发明领域事实、示例 ADR、capability spec 或 change。

## Process

### 1. Preflight the repository

- 阅读 root instructions，以及足以确认 repository root 和 workspace 形状的高信号文件。
- 记录现有 Git 状态；已有用户改动不是本次初始化产生的改动。
- 检查 root `CONTEXT.md`、root `docs/adr/` 与 `openspec/`。

完成条件：目标 root 与本阶段开始前的状态已确定。

### 2. Stop incompatible initialization

只检查 root `CONTEXT-MAP.md` 路径是否存在，不读取、解析或校验其内容。存在时报告：

> 已存在 `CONTEXT-MAP.md`，项目可能运行过其他初始化工具；停止执行。

随后停止本阶段，不运行 `spect init` 或 helper。顶层 `/setup-skills` 保留此前已完成的 CLI 和 agent docs 阶段，并将本阶段报告为 failed。

完成条件：root `CONTEXT-MAP.md` 不存在；否则本阶段已在自身任何写入前停止。

### 3. Initialize and validate OpenSpec

运行：

```bash
spect init <project-root>
```

`spect init` 是 OpenSpec 初始化与校验的唯一 owner。它必须：

- 对新项目补齐 default spec-driven config、schema、templates、`specs/` 与 `changes/archive/`。
- 只把 `config.yaml` 作为配置入口。
- 保留既有文件，不提供覆盖模式。
- 按实际生效的 config 校验 schema、template references 和已有 artifacts。
- 保留有效的 custom schema，不注入无关的 default schema。
- 在语义校验完成后才写入；写入失败时回滚本次新创建的路径。

命令失败时保留诊断并停止，不继续创建 CONTEXT 或 ADR。本 reference 不重复解析 schema，也不再次运行 `spect validate`。

完成条件：`spect init` 成功退出。

### 4. Initialize CONTEXT and ADR paths

运行 setup skill 随附的 helper：

```bash
node <setup-skills-directory>/scripts/init-flow-docs.mjs <project-root>
```

helper 会：

- 再次检查 root `CONTEXT-MAP.md`，存在时以非零状态退出且不写入。
- 缺少 root `CONTEXT.md` 时，从 [CONTEXT template](../assets/CONTEXT.md) 创建只含 glossary 结构的文件。
- 原样保留已有 root `CONTEXT.md`。
- 补齐 root `docs/adr/`。

完成条件：helper 成功退出，root `CONTEXT.md` 与 root `docs/adr/` 存在，既有文件内容未改变。

### 5. Verify and report

确认：

- repository 有 root `CONTEXT.md` 与 root `docs/adr/`。
- `spect init` 已成功完成 OpenSpec 创建和校验。
- `config.yaml` 是唯一配置入口。
- Git repository 中只检查本阶段拥有的路径，并将阶段开始前已有改动排除在本次结果之外；非 Git repository 执行相同的结构检查。
- 本阶段变动通过 `git diff --check`，没有范围外修改。

报告 created、preserved 与 validated paths。

完成条件：所有检查通过，报告准确区分本阶段变动与此前状态。
