## What it does

`implement` 构建那些已经被决定好的工作。你把它指向一个 OpenSpec change、一份 [spec](https://www.aihero.dev/ai-coding-dictionary/spec)，或你在对话里刚刚达成的计划，它就写代码、在 seams 上驱动 [tdd](https://aihero.dev/skills-tdd)、落地前运行完整测试套件，然后运行 [code-review](https://aihero.dev/skills-code-review)，并提交到当前 branch。

它从不重新打开计划。没有访谈、没有澄清轮、没有提出不同方案。上游敲定的任何东西就是输入，这个 skill 的全部工作就是把它变成提交。这正是它区别于对一个全新的 [agent](https://www.aihero.dev/ai-coding-dictionary/agent) 输入"build this"的地方——后者会在构建的同时乐于重新设计这件工作。

OpenSpec 输入通过 `spect` 解析：change discovery、planning gate、artifact 上下文都来自 CLI，而不是手工读路径。`tasks.md` checkboxes 是唯一的进度状态——`implement` 边做边勾选，并凭这个状态从任何中断处续做。

## When to reach for it

你通过输入 `/implement [change-name]` 调用它——agent 不会自行取用它。它带着 `disable-model-invocation: true` 发布，所以其他 skill 也不能调用它。无论 [ask-matt](https://aihero.dev/skills-ask-matt) 还是 `to-plan` 说"然后对这个 change 走 `/implement`"，那都是给你的指令，而不是 agent 会在未提示下自己去做的事。

工作当前住在哪里，决定了这是否是正确的 skill：

| 工作… | 该用哪个 |
| --- | --- |
| 是一个只有 proposal、尚未 planning 的 OpenSpec change | 先用 `to-plan`，然后 `/implement <change-name>` |
| 是一份 spec，而且构建很小 | 直接对着 spec 走 `/implement` |
| 只存在于你刚刚那场对话里，而且仍然很小 | 就在那里、在同一个 window 里走 `/implement` |
| 还没有写在任何地方 | [grill-with-docs](https://aihero.dev/skills-grill-with-docs)，如果没有 codebase 则用 [grill-me](https://aihero.dev/skills-grill-me) |
| 是一个你想 test-first 的具体行为，没有 spec | 直接 [tdd](https://aihero.dev/skills-tdd) |
| 已经构建好了，你想让它被检查 | 直接 [code-review](https://aihero.dev/skills-code-review) |

同一个 session 的情况值得点名。如果计划只活在对话线程里，调用时就说清楚；如果来源是 OpenSpec，传入 change name；省略参数时，skill 会列出全部 active changes 让你选择。

## Prerequisites

`implement` 提交到你当前所在的 branch。它不会创建分支，也不会问。开始之前确认你正处于你想要工作落在其上的 branch。

OpenSpec 输入假设 `spect` 可用——`/setup-skills`、`/to-spec` 与 `/to-plan` 在它们运行时已经做过版本检查与安装回退。运行时 `spect` 命令缺失或报错，`implement` 停止并报告，不代为安装。

## What one run does

一次运行先解析 change，然后按状态行动——这让一个 change 可以跨越中断存活：

| 状态 | 行为 |
| --- | --- |
| 存在未勾选任务 | 实现：在未勾选任务上驱动 `/tdd`，边做边勾选 |
| 全部勾选，有未提交变更 | 跳到收尾闸：完整套件 → 提交 → 审查 |
| 全部勾选，工作区干净 | 重跑审查闸 |

实现节拍：

1. 解析 change（`spect list --json`，exact match 优先，不静默选择近似结果），然后做 planning gate：`tasks.md` 缺失或 planning 未完成，停止并指向 `/to-plan`。
2. 通过 `spect instructions apply` 读取上下文——proposal、delta specs、design 与 tasks。
3. 复述 seams：`specs/**/*.md` 的 Scenarios 是主要测试锚点，`design.md` Decisions 中已确认的 test seams 作为参考；两处都没有时警告，并由 `/tdd` 当场发问。
4. 在未勾选任务上驱动 [tdd](https://aihero.dev/skills-tdd)，优先级按依赖顺序与代码现状判断。每完成一项任务即时勾选对应 checkbox；不勾选未实际完成的相邻任务。

收尾闸：

5. 运行完整测试套件；失败则回到实现。
6. 记录当前 `HEAD` 为 review fixed point——change 完成前不做任何提交，`HEAD` 全程不动。把代码与 `tasks.md` 勾选作为一次提交落在当前 branch，commit message 引用 change name。
7. 对 fixed point 运行 [code-review](https://aihero.dev/skills-code-review)，显式传入本 change 的 delta specs 与 proposal 作为 Spec 轴来源。修复 findings、重新通过测试后再次提交；review 只跑一轮，不循环。

因为没有 checkpoint 提交，中断的运行会把一切留在工作区；再次调用 `/implement <change-name>` 凭 checkbox 状态续做。全部任务已勾选但提交未发生时，重跑直达收尾闸；提交已落地但审查没跑时，重跑会补跑审查，并从最老引用该 change name 的 commit 推导 fixed point。

## Pre-agreed seams

这个 skill 赖以运行的观念是 **seam**：你在其上观察行为的公开边界，而不伸手进去。测试活在 seams 上。在写任何代码之前就认可一个 seam、并在其上工作，正是让测试保持持久的原因，因为底下的实现可以被重写，而测试不必跟着变动。

OpenSpec 输入为 seams 提供了 canonical 的家：spec Scenarios 是主要锚点——`specs/**/*.md` 中每个 Scenario 都是一个可测试的行为单元——而 `design.md` Decisions 记录 `to-plan` grilling 中确认的 test seams。`implement` 读取两者，并在 `/tdd` 写任何测试之前复述将要测试的 seams。两处都找不到时，它明确警告并让 `/tdd` 当场发问——不硬停，但也不再悄悄退化成"就是把代码写了"。

## Common questions

**它完成了，但我的任务清单仍然没有更新。**

OpenSpec 输入在任务完成时即时勾选 `tasks.md` checkboxes——在提交之前，而不是之后。如果运行中断，工作区里的 checkboxes 就是记录；再次调用即从那里续做。

**我可以一次指向整个大 change，或者并行运行几个吗？**

调用单位就是 change，一次运行在 window 允许范围内能推多少推多少；中断的运行凭 checkboxes 续做。不存在跨队列的批量派发和 [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) 扇出。在同一个 checkout 里并排运行多个 `/implement` sessions 会共享 working directory、index 和 HEAD；需要并行时由调用方提供隔离的 worktrees 和调度，而不是让本 skill 猜测安全边界。

**它可以开 pull request 而不是 commit 吗？**

不是内建的。它直接提交到当前 branch，这让一些人觉得太急切：代码在他们有机会验证它能工作之前就落地了。没有任何配置 flag，也没有 PR 模式。人们会在调用里覆盖它（"commit 到一个 branch 并开一个 PR"），或者通过编辑他们本地的那份 skill 副本来覆盖。

**`code-review` 说它看不到我的变更。**

已修复。`implement` 现在先提交再审查：收尾闸先落下一次提交，然后对提交前记录的 fixed point 运行 `/code-review`——也就是 branch 出发的那个点。对已提交 change 的重入审查，从最老引用该 change name 的 commit 推导 fixed point，解析不出来时询问用户。仍有些人刻意完全不想要运行内的审查，因为一个审查自己刚写的代码的 agent 会偏向自己的方案。在一个全新的 session 里对着一个 fixed point 运行 [code-review](https://aihero.dev/skills-code-review) 是合法的替代方案，这正是那个 skill 把它的两个轴线放在独立的 sub-agents 里运行的原因。

**一次运行烧掉了 150k tokens。我用错了吗？**

很可能是 slice 太大。一次运行要做 codebase 探索、red-green loops、完整测试套件和审查；杠杆在上游：在 `to-plan` 中把 change 与 `tasks.md` slices 调到能装进一个全新的 [context window](https://www.aihero.dev/ai-coding-dictionary/context-window)。一个 change 反复超限时拆分 change，而不是调高 effort。

## It's working if

- session 以解析 change、读取它的 artifacts、复述它将构建什么来开场，而不是问你该构建什么。
- 你能在 trace 里看到一次真实的 `/tdd` 调用，而不只是在 diff 里出现测试。
- checkboxes 随任务完成即时勾选，中断的运行能凭它们续做。
- 完整测试套件在提交之前跑过一次。
- 运行在你当前 branch 上到达一次引用 change name 的提交，其后的审查能看到整个 change 的 diff。

## Where it fits

`implement` 是 main chain 的 build step，倒数第二：

```txt
grill-with-docs → to-spec → to-plan → implement → code-review
```

它的邻居是 `to-plan`——产出它所消费的 OpenSpec tasks；[tdd](https://aihero.dev/skills-tdd)——它在每个 seam 上内部驱动它；以及 [code-review](https://aihero.dev/skills-code-review)——它在提交之后运行它。它位于 planning 下游并信任已确认的 specs、design 和 tasks，不重新打开方案。

这份信任正是 [wayfinder](https://aihero.dev/skills-wayfinder) 在 [to-spec](https://aihero.dev/skills-to-spec) 处并入这条 chain、而不是把它的地图直接循环进 `implement` 的原因。只有当场得出 effort 确实很小时，才从一张地图直接去 `implement`。

归档不在这条 chain 上：change 提交并审查完成后，`spect archive <change-name>` 会把 delta specs 合并进 `openspec/specs/`——由你自己运行。

当你不确定自己身处哪个 flow 时，[ask-matt](https://aihero.dev/skills-ask-matt) 是覆盖全集的 router。
