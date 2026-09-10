# spect CLI 命令手册

`spect`（spectools）是 devtrain-skills 的精简版 OpenSpec CLI：规范驱动开发的变更管理命令。单文件可执行程序随 `init-cli` skill 分发，安装无需联网与 npm，仅需 Node.js >= 22。本手册基于 spect 0.1.2 实测输出编写。

## 安装

**macOS / Linux**

```bash
npx skills@latest add manzusaka/devtrain-skills   # 选择 init-cli skill
bash <init-cli skill 目录>/install-spect.sh        # 安装到 ~/.local/bin/spect
spect --version                                    # 验证
```

`~/.local/bin` 不在 PATH 中时，把 `export PATH="$HOME/.local/bin:$PATH"` 加入 shell 配置。

**Windows（PowerShell）**

```powershell
npx skills@latest add manzusaka/devtrain-skills   # 选择 init-cli skill
powershell -NoProfile -ExecutionPolicy Bypass -File <init-cli skill 目录>\install-spect.ps1   # 安装到 %USERPROFILE%\.local\bin
spect --version                                    # 配置 PATH 后验证
```

`%USERPROFILE%\.local\bin` 不在 PATH 中时，按安装脚本输出的指引执行 `[Environment]::SetEnvironmentVariable(...)` 命令（写入当前用户 PATH），然后重新打开终端。

## 核心概念

- **openspec/ 根目录**：`spect init` 在项目里创建的脚手架。所有命令从当前目录向上查找最近的 `openspec/` 根目录。
- **变更（change）**：`openspec/changes/<name>/` 下的一次未归档变更，由 proposal、delta specs、design、tasks 四类制品组成。
- **制品顺序**：`proposal → specs / design → tasks`（`spect status` 会按依赖显示阻塞关系）。
- **归档**：完成后 `spect archive` 把 delta 合并进 `openspec/specs/`，并把变更移入 `openspec/changes/archive/<日期>-<name>/`。

## 典型工作流

```bash
spect init                          # 1. 初始化脚手架
spect new change add-search         # 2. 创建变更
spect status --change add-search    # 3. 查看下一个要写的制品
spect instructions proposal --change add-search   # 4. 获取制品写作指令（给 agent）
# ... 按模板补齐 proposal.md / specs/ / design.md / tasks.md ...
spect validate add-search --type change --strict  # 5. 校验
spect archive add-search -y         # 6. 归档并合并 specs
```

## 命令参考

### `spect init [path]`

在目标目录初始化并校验 `openspec/`（完全非交互）。模板内容与 init-cli skill 的 `assets/schemas/` 完全一致。命令只补缺失文件，不提供覆盖模式；已有 config、schema、templates 与 artifacts 必须先通过严格校验。

产出：

```text
openspec/config.yaml
openspec/schemas/schema.yaml
openspec/schemas/templates/{proposal,spec,design,tasks}.md
openspec/specs/.gitkeep
openspec/changes/archive/.gitkeep
```

```console
$ spect init
创建 openspec/config.yaml
创建 openspec/schemas/schema.yaml
...
OpenSpec 脚手架已就绪：/path/to/project/openspec
下一步：用 spect new change <name> 创建你的第一个变更。
```

重复运行会保留已有文件。`config.yaml` 是唯一配置入口；custom schema 按实际生效配置校验，不会额外注入 default schema。

### `spect new change <name>`

创建新的变更目录（kebab-case 命名）。

| 选项 | 说明 |
| --- | --- |
| `--description <text>` | 添加到变更 README.md 的描述 |
| `--goal <text>` | 随变更存储的可选目标元数据 |
| `--schema <name>` | 工作流 schema（默认 spec-driven） |
| `--json` | JSON 输出 |

```console
$ spect new change add-search --description "为产品增加全文搜索能力"
已创建变更 'add-search'，位置 openspec/changes/add-search/
Schema：spec-driven
下一步：spect status --change add-search
```

### `spect status --change <name>`

显示变更的制品完成状态与依赖阻塞。`--change` 为必需选项；缺省会列出可用变更。

| 选项 | 说明 |
| --- | --- |
| `--change <id>` | 变更名称（必需） |
| `--schema <name>` | schema 覆盖（默认从 config.yaml 检测） |
| `--json` | JSON 输出（含各制品路径） |

```console
$ spect status --change add-search
变更：add-search
Schema：spec-driven
进度：0/4 个制品已完成

[ ] proposal
[-] specs（被阻塞：proposal）
[-] design（被阻塞：proposal）
[-] tasks（被阻塞：specs, design）
```

### `spect list`

列出活跃变更（默认）或规范。

| 选项 | 说明 |
| --- | --- |
| `--specs` | 列出规范而非变更 |
| `--changes` | 明确列出变更（默认） |
| `--sort <order>` | `recent`（默认）或 `name` |
| `--json` | JSON 输出（含任务进度与状态） |

```console
$ spect list
变更：
  fix-login-bug     无任务           刚刚
  add-search        无任务           刚刚

$ spect list --specs
规范：
  search     需求数 1
```

### `spect show [item-name]`

显示变更或规范。类型不明确时用 `--type` 指定；不带参数时交互式选择。

| 选项 | 说明 |
| --- | --- |
| `--type <type>` | `change` 或 `spec` |
| `--json` | JSON 输出（结构化解析，会校验 proposal 章节） |
| `--deltas-only` | 仅 JSON：只显示 deltas（change） |
| `--requirements-only` | `--deltas-only` 的别名（已弃用，change） |
| `--requirements` | 仅 JSON：仅显示需求，排除场景（spec） |
| `--no-scenarios` | 仅 JSON：排除场景内容（spec） |
| `-r, --requirement <id>` | 仅 JSON：按 ID 显示特定需求，从 1 开始（spec） |
| `--no-interactive` | 禁用交互式提示 |

```console
$ spect show add-search --type change --no-interactive
# Proposal: add-search
...

$ spect show search --type spec --no-interactive
# search Specification
## Purpose
...
```

注意：`--json` 模式会对 proposal 做结构化校验（例如要求 `## Why` + `## What Changes` 章节），不符合时输出 `status` 错误数组而非内容。

### `spect validate [item-name]`

验证变更和规范。

| 选项 | 说明 |
| --- | --- |
| `--all` | 验证所有更改和规范 |
| `--changes` / `--specs` | 只验证某一类 |
| `--archived` | 验证已归档变更的任务是否全部完成（适合 pre-commit lint） |
| `--type <type>` | 项目类型不明确时指定 `change`/`spec` |
| `--strict` | 严格模式 |
| `--json` | JSON 验证报告 |
| `--concurrency <n>` | 最大并发数（默认环境变量 OPENSPEC_CONCURRENCY 或 6） |
| `--no-interactive` | 禁用交互式提示 |

```console
$ spect validate add-search --type change --strict --no-interactive
变更 'add-search' 验证通过

$ spect validate --all --no-interactive
✓ change/add-search
✗ change/fix-login-bug
汇总：通过 1 项，失败 1 项（共 2 项）
详情：spect validate fix-login-bug --type change
```

### `spect instructions [artifact]`

输出制品写作的增强指令（供 agent 消费），另有两个特殊分支：`implement`（实现指令）与 `archive`（归档输入）。

| 选项 | 说明 |
| --- | --- |
| `--change <id>` | 变更名称 |
| `--schema <name>` | schema 覆盖 |
| `--json` | JSON 输出 |

```console
$ spect instructions proposal --change add-search
<artifact id="proposal" change="add-search" schema="spec-driven">
<task>
为变更 "add-search" 创建 proposal 产出物。
...

$ spect instructions implement --change add-search
## Implement: add-search
### 上下文文件
- proposal: .../openspec/changes/add-search/proposal.md
...
```

### `spect archive [change-name]`

归档已完成的变更：把 delta specs 合并进 `openspec/specs/`，变更目录移入 `openspec/changes/archive/<日期>-<name>/`。

| 选项 | 说明 |
| --- | --- |
| `-y, --yes` | 跳过确认提示 |
| `--skip-specs` | 跳过规范更新（基础设施、工具或纯文档变更） |
| `--no-validate` | 跳过验证（不推荐） |
| `--json` | JSON 输出（非交互） |

```console
$ spect archive add-search -y
任务状态：✓ 完成
要更新的 specs：
  search：创建
正在应用变更到 openspec/specs/search/spec.md：
  + 1 新增
总计：+ 1, ~ 0, - 0, → 0
Specs 更新成功。
变更 'add-search' 已归档为 '2026-08-20-add-search'。
```

归档前会做非阻塞的 proposal 章节警告（见"已知限制"）。

### `spect context`

打印已解析 OpenSpec 根目录的工作上下文（根路径、schema、config.yaml 中的 context 段落）。

| 选项 | 说明 |
| --- | --- |
| `--json` | JSON 代理简报 |

```console
$ spect context
OpenSpec 根目录：/path/to/project（nearest）
Schema：spec-driven

Use CONTEXT.md as the source of truth for domain language and business rules.
...
```

### `spect schemas`

列出可用的工作流 schema 及产出物链。

| 选项 | 说明 |
| --- | --- |
| `--json` | JSON 输出 |

```console
$ spect schemas
可用 Schema：
  spec-driven（项目）
    默认 OpenSpec 工作流 - proposal → specs → design → tasks
    产出物：proposal → specs → design → tasks
```

### `spect templates`

显示 schema 中所有产出物的已解析模板路径。

| 选项 | 说明 |
| --- | --- |
| `--schema <name>` | 指定 schema（默认 spec-driven） |
| `--json` | JSON 输出（产出物 ID → 模板路径映射） |

```console
$ spect templates
Schema：spec-driven
来源：project
proposal:
  /path/to/project/openspec/schemas/templates/proposal.md
...
```

### 全局选项

| 选项 | 说明 |
| --- | --- |
| `-V, --version` | 输出版本号 |
| `-h, --help` | 显示命令帮助（`spect help <command>` 查看子命令帮助） |
| `--no-color` | 禁用彩色输出 |

## 已知限制

- **store 机制已移除**：上游的 `--store`、`store` 命令组不受支持；config.yaml 中的 `references:` 声明只会得到警告。
- **proposal 章节警告**：验证器期望 `## Why` + `## What Changes`，而 init-cli assets 模板使用 `## User story` 等章节，因此 `archive` 时会出现非阻塞警告、`show --json` 会报 `show_error`。阶段二统一模板与校验规则。
- **schema 解析顺序**：项目本地 `openspec/schemas/`（扁平布局的 `schema.yaml` 承载默认 schema）→ 用户覆盖目录；单文件 bundle 不携带包内 schemas，请先 `spect init`。
