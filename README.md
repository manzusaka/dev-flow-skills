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

这些 skills 按一个维度区分：谁能调用它们。**User-invoked** skills 只有在你输入名称时才能触达（例如 `/grill-me`）；它们的工作是编排。**Model-invoked** skills 可以由你调用，也可以在任务匹配时由 agent 自动触达；它们承载可复用纪律。User-invoked skill 可以调用 model-invoked skills，但不能调用另一个 user-invoked skill。

#### Engineering

我每天用于代码工作的 skills。

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** - 询问当前情境适合哪个 skill 或 flow；它是本仓库 user-invoked skills 的 router。
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** - 追问式访谈，同时构建项目的 domain model、打磨术语，并内联更新 `CONTEXT.md` 与 ADRs。
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** - 扫描 codebase 中的 deepening opportunities，生成可视化 HTML report，然后围绕你选中的候选项继续 grilling。
- **[implement](./skills/engineering/implement/SKILL.md)** - 基于 spec、OpenSpec task group 或 tracker ticket 实现一段工作，在预先约定的 seams 处驱动 `/tdd`，并在提交前以 `/code-review` 收尾。

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

#### Flows

围绕 OpenSpec planning 与 issue tracker 的规划和交付流程。

**User-invoked**

- **[setup-skills](./skills/flows/setup-skills/SKILL.md)** - 初始化一个 repository 的工程前置：spect CLI、agent instructions 与 CONTEXT、ADR、OpenSpec 脚手架。
- **[triage](./skills/flows/triage/SKILL.md)** - 通过 triage roles state machine 推进 issues。
- **[wayfinder](./skills/flows/wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 issue tracker 上的 decision tickets 共享 map，逐一解决直到通往 destination 的路清晰。
- **[to-spec](./skills/flows/to-spec/SKILL.md)** - 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 `proposal.md`。
- **[to-tickets](./skills/flows/to-tickets/SKILL.md)** - 读取 OpenSpec proposal，经过架构 grilling 补齐 delta specs、design 与 tracer-bullet tasks。

**Model-invoked**

- 当前没有 model-invoked skills。

#### Productivity

通用工作流工具，不限于代码。

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** - 围绕计划或设计持续追问，直到 design tree 的每个分支都被解决。
- **[handoff](./skills/productivity/handoff/SKILL.md)** - 把当前对话压缩成 handoff document，让另一个 agent 可以继续。
- **[teach](./skills/productivity/teach/SKILL.md)** - 使用当前目录作为 stateful teaching workspace，在多个 sessions 中教用户一个新 skill 或概念。
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)** - 把一个你自己答不了的 decision 变成一份 Markdown questionnaire，交给唯一能回答它的人——异步填写，或在一次会议里一起完成。它追问的是“发送”本身（发给谁、你想拿回什么），而不是主题。
- **[wait-what](./skills/productivity/wait-what/SKILL.md)** - 某条消息没讲明白的瞬间就发它。agent 会补上你缺的 context，用平实的语言重新表述，并使用你 `CONTEXT.md` 里的词汇。

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)** - 围绕计划、decision 或 idea 持续访谈用户，直到 design tree 的每个分支都被解决。它是 `grill-me`、`grill-with-docs`、`triage`、`wayfinder` 和 `improve-codebase-architecture` 背后的可复用访谈 primitive。
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)** - 为 agents 编写文档：skills、AGENTS.md/CLAUDE.md，以及任何 agent 通过 pointer 到达的文档。
