# Engineering

我每天用于代码工作的 skills。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[ask-matt](./ask-matt/SKILL.md)** - 询问当前情境适合哪个 skill 或 flow；它是本仓库 user-invoked skills 的 router。
- **[grill-with-docs](./grill-with-docs/SKILL.md)** - 追问式访谈，同时构建项目的 domain model、打磨术语，并内联更新 `CONTEXT.md` 与 ADRs。
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** - 扫描 codebase 中的 deepening opportunities，生成可视化 HTML report，然后围绕你选中的候选项继续 grilling。
- **[implement](./implement/SKILL.md)** - 基于 spec、OpenSpec task group 或 tracker ticket 实现一段工作，在预先认可的 seams 上驱动 `/tdd`，并在提交前以 `/code-review` 收尾。

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
