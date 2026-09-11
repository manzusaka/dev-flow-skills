# Devtrain Skills

## 关于Devtrain Skills

这是 [`mattpocock/skills`](https://github.com/mattpocock/skills) 的针对自身业务做了修改，本仓库后续会自行修改。

## 30 秒安装

1. 运行 skills.sh installer：

```bash
npx skills@latest add manzusaka/devtrain-skills
```

2. 选择你想安装的 skills，以及要安装到哪些 coding agents。**确保选择 `/setup-skills`**。

3. 在你的 agent 中运行 `/setup-skills`。它会：
   - 安装或更新 spect（精简版 OpenSpec CLI）
   - 初始化或整合 root `AGENTS.md` 与 `CLAUDE.md`
   - 初始化 `CONTEXT.md`、`docs/adr/` 与 `openspec/` 脚手架

4. 完成后即可开始使用。

### 作为 Claude Code plugin 安装

如果你更喜欢无需手动维护的即装即用方式，这些 skills 也以原生 [Claude Code plugin](https://code.claude.com/docs/en/plugins) 发布。与把可编辑文件复制进 repo 不同，plugin 会把整套 skills 安装为受管理的 bundle；新版本发布后可以统一更新。

在 Claude Code 中运行：

```
/plugin marketplace add manzusaka/devtrain-skills
```

### 为什么这些 Skills 存在

我创建这些 skills，是为了解决我在 Claude Code、Codex 和其他 coding agents 中反复看到的常见失败模式。

### Reference

这些 skills 按一个维度区分：谁能调用它们。**User-invoked** skills 只有在你输入名称时才能触达（例如 `/handoff`）；它们的工作是编排。**Model-invoked** skills 可以由你调用，也可以在任务匹配时由 agent 自动触达；它们承载可复用纪律。User-invoked skill 可以调用 model-invoked skills，但不能调用另一个 user-invoked skill。

#### Engineering

我每天用于代码工作的 skills。

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** - 询问当前情境适合哪个 skill 或 flow；它是本仓库 user-invoked skills 的 router。
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** - 扫描 codebase 中的 deepening opportunities，生成可视化 HTML report，然后围绕你选中的候选项继续 grilling。
- **[setup-skills](./skills/engineering/setup-skills/SKILL.md)** - 初始化一个 repository 的工程前置：spect CLI、agent instructions 与 CONTEXT、ADR、OpenSpec 脚手架。
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 `docs/wayfinding/` 下的 decision records 共享 map，逐一解决直到通往 destination 的路清晰。
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** - 追问式访谈，同时构建项目的 domain model、打磨术语，并内联更新 `CONTEXT.md` 与 ADRs。
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** - 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 `proposal.md`。
- **[to-plan](./skills/engineering/to-plan/SKILL.md)** - 读取 OpenSpec proposal，经过架构 grilling 补齐 delta specs、design 与 tracer-bullet tasks。
- **[implement](./skills/engineering/implement/SKILL.md)** - 实现 OpenSpec change 或 spec 中指定的工作：按 `tasks.md` checkbox 状态续做，收尾统一提交并以 `/code-review` 审查。
- **[finalize-spec](./skills/engineering/finalize-spec/SKILL.md)** - 收尾已完成的 OpenSpec change：沉淀知识、生成摘要、委托 `spect archive` 归档并合并规格，并把本次 change 的提交压成单个 commit。

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)** - 构建 throwaway prototype 来回答一个设计问题——state/logic 问题产出一个可分享的单一 HTML 文件，或产出几个可从同一路由切换的 radically different UI 变体。
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** - 面向棘手 bug 和性能回退的纪律化诊断循环：构建一个会对这个 bug 变红的 feedback loop → minimise → hypothesise → instrument → fix → regression-test。
- **[research](./skills/engineering/research/SKILL.md)** - 对照 high-trust primary sources 调研问题，并把带引用的 findings 保存为 Markdown 文件。
- **[tdd](./skills/engineering/tdd/SKILL.md)** - 使用 red-green-refactor 循环做 test-driven development；一次一个 vertical slice 地构建功能或修复 bug。
- **[init-cli](./skills/engineering/init-cli/SKILL.md)** - 检查、安装或更新 spect（精简版 OpenSpec CLI）命令；单文件可执行程序与 OpenSpec 模板随 skill 分发，安装无需联网与 npm。
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** - 主动构建和打磨项目 domain model：挑战术语、用 edge-case scenarios 做压力测试，并内联更新 `CONTEXT.md` 与 ADRs。
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** - 设计 deep modules 的共享纪律和词汇：小 interface、clean seam、通过 interface 测试。
- **[code-review](./skills/engineering/code-review/SKILL.md)** - 对 fixed point 以来的 diff 做双轴 review：Standards 与 Spec 分开检查，并用并行 sub-agents 运行。
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** - 逐个 hunk 处理正在进行的 git merge/rebase conflict，按追溯到各方 primary source 的 intent 解决，然后完成操作——绝不 `--abort`。
- **[wizard](./skills/engineering/wizard/SKILL.md)** - 生成一个交互式 bash wizard，带人走过只有人才能完成的步骤：provisioning infrastructure、设置 credentials 或 CI secrets、操作陌生的第三方 dashboard，或执行一次性 migration/cutover。
- **[using-git-worktrees](./skills/engineering/using-git-worktrees/SKILL.md)** - 确保 feature 工作在隔离的 workspace 中进行：优先原生 worktree 工具，没有时 fallback 到 git worktree，并完成 setup 与 baseline 验证。

#### Productivity

通用工作流工具，不限于代码。

**User-invoked**

- **[handoff](./skills/productivity/handoff/SKILL.md)** - 把当前对话压缩成 handoff document，让另一个 agent 可以继续。

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)** - 围绕计划、decision 或 idea 持续访谈用户，直到 design tree 的每个分支都被解决。它是 `grill-with-docs`、`wayfinder` 和 `improve-codebase-architecture` 背后的可复用访谈 primitive。
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)** - 为 agents 编写文档：skills、AGENTS.md/CLAUDE.md，以及任何 agent 通过 pointer 到达的文档。
