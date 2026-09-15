# Engineering

面向日常代码工作的 skills。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[ask-matt](./ask-matt/SKILL.md)** - 询问当前情境适合哪个 skill 或 flow；它是本仓库所有 skills 的 router。
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** - 扫描 codebase 中的 deepening opportunities，生成可视化 HTML report，然后围绕你选中的候选项继续 grilling。
- **[setup-skills](./setup-skills/SKILL.md)** - 初始化一个 repository 的工程前置：spect CLI、agent instructions 与 CONTEXT、ADR、OpenSpec 脚手架。
- **[wayfinder](./wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 `docs/wayfinding/` 下的 decision records 共享 map，逐一解决直到通往 destination 的路清晰。
- **[grill-with-docs](./grill-with-docs/SKILL.md)** - 追问式访谈，同时构建项目的 domain model、打磨术语，并内联更新 `CONTEXT.md` 与 ADRs。
- **[to-spec](./to-spec/SKILL.md)** - 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 `proposal.md`。
- **[to-plan](./to-plan/SKILL.md)** - 读取 OpenSpec proposal，经过架构 grilling 补齐 delta specs、design 与 tracer-bullet tasks。
- **[implement](./implement/SKILL.md)** - 实现 OpenSpec change 或 spec 中指定的工作：按 `tasks.md` checkbox 状态续做，收尾统一提交并以 `/code-review` 审查。
- **[finalize-spec](./finalize-spec/SKILL.md)** - 收尾已完成的 OpenSpec change：沉淀知识、生成摘要、委托 `spect archive` 归档并合并规格，并把本次 change 的提交压成单个 commit。

## Model-invoked

模型或用户都可以调用（description 包含足够丰富的触发措辞，方便模型自动找到它们）。

- **[prototype](./prototype/SKILL.md)** - 构建 throwaway prototype 来回答一个 design 问题：可以是回答 state/logic 问题的可运行终端 app，也可以是多个可切换的 UI 变体。

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** - 面向棘手 bug 和性能回退的纪律化诊断循环：reproduce -> minimise -> hypothesise -> instrument -> fix -> regression-test。
- **[research](./research/SKILL.md)** - 对照高可信 primary sources 调研问题，并把带引用的 findings 保存为 repo 中的 Markdown 文件，作为 background agent 运行。
- **[tdd](./tdd/SKILL.md)** - 使用 red-green-refactor 循环做 test-driven development；一次一个 vertical slice 地构建功能或修复 bug。
- **[init-cli](./init-cli/SKILL.md)** - 检查、安装或更新 spect（精简版 OpenSpec CLI）命令；单文件可执行程序与 OpenSpec 模板随 skill 分发，安装无需联网与 npm。
- **[domain-modeling](./domain-modeling/SKILL.md)** - 主动构建和打磨项目的 domain model：挑战术语、用场景做压力测试，并内联更新 `CONTEXT.md` 与 ADRs。
- **[codebase-design](./codebase-design/SKILL.md)** - 用于设计 deep modules 的共享纪律和词汇：小 interface、清晰 seam、通过 interface 测试。
- **[code-review](./code-review/SKILL.md)** - 对固定点之后的 diff 做双轴 review：**Standards**（是否遵循 repo 的编码规范，外加 Fowler smell baseline？）和 **Spec**（是否忠实实现了源头的 issue/PRD？），作为并行 sub-agents 运行。
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)** - 逐 hunk 处理正在进行的 git merge 或 rebase conflict，按追溯到每一侧 primary source 的意图来解决，然后完成该操作——绝不 `--abort`。
- **[wizard](./wizard/SKILL.md)** - 生成交互式 bash wizard，引导人完成只有他们能执行的步骤：provisioning 基础设施、设置 credentials 或 CI secrets、走查不熟悉的第三方 dashboard，或运行一次性 migration 或 cutover。
- **[using-git-worktrees](./using-git-worktrees/SKILL.md)** - 确保 feature 工作在隔离的 workspace 中进行：优先原生 worktree 工具，没有时 fallback 到 git worktree，并完成 setup 与 baseline 验证。
