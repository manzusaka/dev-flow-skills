# spect CLI 移植实现计划（阶段一）

把参考仓库 `openspec/`（`@studyzy/openspec-cn` v1.9.0，本地未跟踪目录）中的 OpenSpec CLI 裁剪移植为本仓库自有的精简 CLI，命令名 **spect**（spectools）。用户通过 `npx skills add manzusaka/dev-flow-skills` 安装 `init-cli` skill 时，随 skill 目录获得编译好的可执行文件与安装脚本，即可把 `spect` 安装到本地环境。

## 已敲定的决定

| 轴 | 决定 |
| --- | --- |
| 移植对象 | 仅 CLI（参考仓库 `src/` + `bin/`），12 个 openspec skills 不移植 |
| 重写深度 | 裁剪式：保留上游架构，删除不保留命令的模块 |
| 命令集（中等集） | `init`、`new change`、`status`、`list`、`show`、`validate`、`archive`、`instructions`、`context`、`schemas`、`templates` |
| 删除命令 | `update`、`view`、`spec`、`store`、`completion`、`feedback`、`config`、`schema`、`doctor`、`workset`、`experimental` |
| init 边界 | 只脚手架 `openspec/`（`config.yaml`、`schemas/`、`specs/`、`changes/`）；`CONTEXT.md`、`docs/adr/` 仍归 `init-flow-docs`；模板以 `skills/engineering/init-cli/assets/schemas/` 为准（2026-08-20 从 spect/assets 迁入 skill）；完全非交互；砍掉 `--tools`、欢迎屏、copilot-cloud |
| 分发 | `npx skills add` 只拷贝 skill 目录：skill 目录内放编译产物 + 安装脚本；src 源码放顶层 `spect/` |
| 新 skill | `skills/engineering/init-cli/`，model-invoked；跑 `spect --version`，command not found 时经用户确认运行安装脚本 |
| 产物形态 | esbuild 单文件 bundle，提交进 skill 目录；用户机器零联网零 npm 依赖（仅需 node >= 22） |
| 安装落点 | `~/.local/bin/spect` + PATH 检测指引 |
| 阶段 | 本次仅阶段一；阶段二（skills 重写定制：setup-skills 触发环境检查等）另起任务；init-flow-docs 调 `spect init` 已于 2026-08-20 完成 |

## 目标目录结构

```text
dev-skills/
├── spect/                                  # 顶层 CLI 源码（裁剪自 openspec/）
│   ├── package.json                        # name: spect, bin: spect, build 脚本
│   ├── tsconfig.json
│   ├── bin/spect.js                        # 开发入口（指向 dist）
│   ├── scripts/build.mjs                   # esbuild bundle + 拷入 skill 目录
│   ├── scripts/embed-schemas.mjs           # 把 assets 模板生成为内嵌 TS 模块
│   └── src/                                # 裁剪后的 TS 源码
└── skills/engineering/init-cli/
    ├── SKILL.md                            # model-invoked
    ├── agents/openai.yaml
    ├── assets/schemas/                     # OpenSpec 模板单一事实来源（构建期内嵌进 bundle）
    ├── install-spect.sh                    # 安装脚本（随 skill 分发）
    └── bin/spect                           # 编译产物（单文件 bundle，提交）
```

## 操作清单

### 操作 1：脚手架 spect/
- 从 `openspec/` 拷贝 `src/`、`bin/`、`tsconfig.json` 到 `spect/`；`schemas/` 只保留 `spec-driven`。
- 新建 `spect/package.json`（name `spect`、version `0.1.0`、type module、bin、依赖裁剪）。
- `.gitignore` 增加 `spect/node_modules/`、`spect/dist/`。
- **验证**：目录结构就位。

### 操作 2：裁剪 CLI
- 重写 `spect/src/cli/index.ts`：只注册保留命令；删除 telemetry、version-check、store-path 逻辑。
- 删除无关模块：`commands/{store,completion,feedback,config,schema,doctor,workset*}.ts`、`core/{update,view,migration,legacy-cleanup,version-check,github-copilot,completions,store}`、`telemetry/` 等，按依赖图收敛。
- **验证**：`npm --prefix spect run typecheck`（tsc --noEmit）通过。

### 操作 3：裁剪 init
- 非交互化：去掉 inquirer 交互、欢迎屏动画、`--tools` 写 slash commands、copilot-cloud。
- 输出对齐 `init-flow-docs/assets/openspec/`：`config.yaml`（schema: spec-driven）、`schemas/schema.yaml`、`schemas/templates/{proposal,spec,design,tasks}.md`、`specs/`、`changes/archive/`。
- 模板单一事实来源 = init-flow-docs assets：构建期由 `embed-schemas.mjs` 生成内嵌模块。
- **验证**：临时目录跑 `spect init`，产出与 assets 逐项一致。

### 操作 4：构建管线
- `spect/scripts/build.mjs`：esbuild 从 `src/cli/index.ts` bundle 成单文件 ESM（含 node shebang，内嵌 schemas），写入 `skills/engineering/init-cli/bin/spect`。
- `spect/package.json` 提供 `npm run build`；仓库顶层 `scripts/build-spect.mjs` 作为入口包装。
- **验证**：bundle 独立跑通 `spect --version`、`spect --help`（不依赖 node_modules）。

### 操作 5：新建 init-cli skill
- `SKILL.md`：model-invoked（无 `disable-model-invocation`），description 面向模型含触发措辞；工作流 = 检查 `spect --version` → 缺失则向用户确认 → 运行目录内 `install-spect.sh` → 复检。
- `agents/openai.yaml`：`interface.display_name` + `interface.short_description`，无 policy block。
- `install-spect.sh`：检查 node → 拷贝 `bin/spect` 至 `~/.local/bin/spect` → chmod +x → PATH 检测与指引（不自动改 shell rc）。
- **验证**：模拟 command not found 场景，脚本安装后 `spect --version` 可用。

### 操作 6：登记
- `.claude-plugin/plugin.json`：skills 数组按字母序插入 `./skills/engineering/init-cli`。
- 顶层 `README.md` Engineering → Model-invoked 加条目（链接 SKILL.md + 一行描述）。
- `skills/engineering/README.md` Model-invoked 分组加同样条目。

### 操作 7：校验
- `claude plugin validate . --strict`
- `node scripts/audit-english.mjs`（新词按需进 allowed 列表）
- `node scripts/check-translation.mjs`
- **验证**：三者全部通过。

### 操作 8：端到端验证
- `npx skills add <本地仓库路径>` 安装 init-cli 到临时目录（或等价的手动拷贝模拟）。
- 运行 `install-spect.sh` → `spect --version`。
- 临时项目跑全部保留命令：`init` → `new change` → `status` → `list` → `show` → `validate` → `instructions` → `context` → `schemas` → `templates` → `archive`。
- **验证**：全部命令按预期工作，`spect init` 输出与 init-flow-docs assets 一致。

## 代定细节（可否决）

- 顶层目录名 `spect/`；版本号 `0.1.0`；安装脚本名 `install-spect.sh`；node >= 22。
- 模板单一事实来源 = `skills/engineering/init-cli/assets/schemas/`：构建期由 `embed-schemas.mjs` 生成内嵌模块（2026-08-20 起；此前依次为 spect/assets/openspec、init-flow-docs assets）。

## 风险

- esbuild 对上游动态 import / ESM-only 依赖的打包行为需实测；若个别依赖无法内嵌则退化为 vendor 进 bundle。
- 上游模块耦合可能使裁剪量大于预期；以 tsc + bundle 双验证收敛。
- `~/.local/bin` 不在默认 PATH 时，脚本只给指引不自动改 rc 文件。

## 阶段二预告（另起任务）

`setup-skills` 触发环境检查与安装；`to-spec`/`to-plan` 借鉴 openspec 规范调整；参考目录 `openspec/` 完成后删除。

## 完成记录（2026-08-19，阶段一）

- `spect/`：69 个 TS 文件、约 1.46 万行（上游 4.2 万行），`tsc --noEmit` 零错误。
- 删除的上游机制：store、telemetry、version-check、completion、config/schema 命令、doctor、workset、view、update、feedback、`change`/`spec` 命令组注册、--tools slash command 生成、copilot-cloud、欢迎屏与全部交互提示。
- 保留命令全部实测通过：`init`（输出与 init-flow-docs assets 逐字节一致、幂等保留、`--force` 覆盖）、`new change`、`status`、`list`（含 `--specs`）、`show`、`validate`（含 `--strict`）、`instructions`、`context`、`schemas`、`templates`、`archive`（delta 正确合并进 `openspec/specs/` 并按日期归档）。
- resolver 增加两处兼容：单文件 bundle 守卫（无包内 schemas 目录时回退）与 dev-skills 扁平布局（`openspec/schemas/schema.yaml` 直接承载默认 schema）。
- 构建：`npm --prefix spect run build` → 单文件 CJS bundle（约 2.4MB，405 模块）→ `skills/engineering/init-cli/bin/spect`；`embed-schemas.mjs` 以 init-flow-docs assets 为单一事实来源生成内嵌模块。
- `init-cli` skill（model-invoked）已登记：`plugin.json`、顶层 README、`skills/engineering/README.md`。
- 校验：`claude plugin validate . --strict` 通过；`check-translation` 通过；`audit-english` 退出码 1 为仓库既有状态（HEAD 与工作区的告警行数逐文件一致，本次改动零新增告警）。
- E2E：`npx skills@latest add <本地路径> -y -s init-cli -a codex` → skill 目录完整拷贝（SKILL.md/openai.yaml/bin/install-spect.sh）→ 运行 `install-spect.sh` → `spect 0.1.0` 安装至 `~/.local/bin` 并可用。

### 已知遗留（阶段二处理）

- `validate` 对 proposal 标题期望 `## Why` + `## What Changes`，assets 模板使用 `## User story`，当前为非阻塞警告；阶段二对齐模板与校验规则。
- 参考目录 `openspec/`（gitignore，未跟踪）保留至阶段二完成后删除。

## 完成记录（2026-08-20，模板事实源迁移至 CLI）

- 模板单一事实来源从 `skills/engineering/init-flow-docs/assets/openspec/` 迁至 `spect/assets/openspec/`；`embed-schemas.mjs` 生成方向随之反转，构建期内嵌模块与 CLI 分发产物（`skills/engineering/init-cli/bin/spect`）同源。
- assets 内容中 4 处 `openspec-cn` 统一为 `spect`（schema.yaml 3 处、templates/proposal.md 1 处）；`spect init` 脚手架产物实测零残留。
- `init-flow-docs` 迁移到 CLI 脚手架：第 3 步先 `spect --version`（缺失时经 `/init-cli` 安装）再 `spect init <project-root>`；脚本瘦身为仅补 `CONTEXT.md` 与 `docs/adr/`；`assets/openspec/` 目录删除；第 4 步校验命令改为 `spect validate --all --strict --no-interactive`。
- 保留语义不变：`spect init` 默认保留已存在文件、只补缺失项（与旧脚本一致）。
- 本次未改 `to-spec`（对齐标准流的变更另起任务）；`plugin.json` 与 README 无 skill 增删，无需 manifest 校验。

## 完成记录（2026-08-20，模板事实源迁入 init-cli skill + 更新流程）

- 模板单一事实来源迁至 `skills/engineering/init-cli/assets/schemas/`，布局：`schema.yaml` 在顶层，`spec-driven/config.yaml` 与 `spec-driven/templates/{proposal,spec,design,tasks}.md` 按 schema 分目录。内容沿用原 `spect/assets/openspec/`（新版 User story/Testing 结构），逐文件移动零改动。
- `embed-schemas.mjs` 改读 skill 新路径，`build.mjs` 注释同步；`spect/assets/openspec/` 删除。
- 删除陈旧的 `spect/schemas/spec-driven/`（内容仍为 openspec-cn 措辞与旧 proposal 结构；单文件 bundle 运行期从不读取，dev 模式由项目本地 schemas 解析兜底）。
- `spect init` 产出行为不变：仍向目标项目写入 `config.yaml`、`schemas/schema.yaml` 与 4 个模板，`to-spec`/`to-plan`/`init-flow-docs` 对项目本地模板的依赖不受影响。
- init-cli 增加更新流程：已装版本与 `node <skill 目录>/bin/spect --version` 一致则报版本结束；不一致经用户确认后覆盖安装。frontmatter description、`agents/openai.yaml`、顶层与 bucket README 条目同步措辞。
- 卫生：删除 skill 目录内 `.DS_Store`；`.gitignore` 增加 `.DS_Store`。
- `validate` 期望 `## What Changes` 与模板 `## User story` 的不一致仍为阶段二事项，本次未动。

## 完成记录（2026-09-02，to-plan 接入 spect CLI + 校验器对齐）

- `to-plan` 全量委托 spect（阶段二预告项「to-spec/to-plan 借鉴 openspec 规范调整」至此全部落地，to-spec 已先行接入）：Step 1 change discovery 改用 `spect list --json`；Step 2 artifact 契约改用 `spect status --change <id> --json` + `spect templates --json`；Step 3/5/6 各阶段契约改用 `spect instructions <artifact> --change <id>`；Step 8 结构验证改用 `spect validate <change-name> --strict --no-interactive`，prose 只保留语义检查（capability 覆盖、占位符与 open question、durable docs 一致性、`git diff --check`）。
- 删除 `skills/flows/to-plan/scripts/list_changes.py` 与 `tests/test_list_changes.py`（共 230 行）：脚本的 `changes + root` JSON shape 本就是按 `spect list` 设计的，CLI 接入后完全冗余。
- to-plan 增加与 to-spec 一致的 CLI 门禁：先 `spect --version`，缺失时经用户确认调用 `/init-cli`；SKILL.md 与 `docs/engineering/to-plan.md` 中「不依赖 OpenSpec CLI」的旧设计声明全部移除，durable doc 同步修正过时的 `/init-flow-docs` 与列表脚本描述。
- 修复阶段一「已知遗留」：校验器 proposal 章节期望与模板不一致。模板单一事实来源使用 `## User story`（to-spec 已按此结构提交），故对齐方向为校验器跟随模板：`change-parser.ts` 与 `markdown-parser.ts` 的章节查找改为 `User story` 优先（保留 `What Changes`/`变更内容` 兼容回退），错误信息与 `GUIDE_MISSING_CHANGE_SECTIONS` 文案同步。实测：含 `## User story` 的 proposal 通过 `show` 解析与 `validate --strict`；章节缺失时报「Change 必须包含 User story 章节」。
- 版本与分发：`spect/package.json` 0.1.2 → 0.1.3，`cli/index.ts` fallback 字面量同步（此前与 package.json 不一致）；`npm --prefix spect run build` 重打单文件 bundle（405 模块）至 `skills/engineering/init-cli/bin/spect`。已安装用户经 `/init-cli` 的版本比对获得更新。
- 校验：`npm --prefix spect run typecheck` 零错误；`claude plugin validate . --strict` 通过。
