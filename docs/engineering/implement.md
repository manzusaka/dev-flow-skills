## What it does

`implement` 构建那些已经被决定好的工作。你把它指向一个 OpenSpec `tasks.md` group、一个 [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket)、一份 [spec](https://www.aihero.dev/ai-coding-dictionary/spec)，或你在对话里刚刚达成的计划，它就写代码、在 seams 上驱动 [tdd](https://aihero.dev/skills-tdd)、边走边 typecheck、最后运行 [code-review](https://aihero.dev/skills-code-review)，并提交到当前 branch。

它从不重新打开计划。没有访谈、没有澄清轮、没有提出不同方案。上游敲定的任何东西就是输入，这个 skill 的全部工作就是把它变成一次 commit。这正是它区别于对一个全新的 [agent](https://www.aihero.dev/ai-coding-dictionary/agent) 输入"build this"的地方——后者会在构建的同时乐于重新设计这件工作。

## When to reach for it

你通过输入 `/implement` 调用它——agent 不会自行取用它。它带着 `disable-model-invocation: true` 发布，所以其他 skill 也不能调用它。无论 [ask-matt](https://aihero.dev/skills-ask-matt) 还是 [to-tickets](https://aihero.dev/skills-to-tickets) 说"然后每个 task group 走 `/implement`"，那都是给你的指令，而不是 agent 会在未提示下自己去做的事。

工作当前住在哪里，决定了这是否是正确的 skill：

| 工作… | 该用哪个 |
| --- | --- |
| 是 tracker 上的一个 ticket | `/implement #42`，每次 [session](https://www.aihero.dev/ai-coding-dictionary/session) 一个 ticket，ticket 之间 [clearing](https://www.aihero.dev/ai-coding-dictionary/clearing) context |
| 是一个只有 proposal、尚未 planning 的 OpenSpec change | 先用 [to-tickets](https://aihero.dev/skills-to-tickets)，然后每个 `tasks.md` group 走 `/implement` |
| 是一份 spec，而且构建很小 | 直接对着 spec 走 `/implement` |
| 只存在于你刚刚那场对话里，而且仍然很小 | 就在那里、在同一个 window 里走 `/implement` |
| 还没有写在任何地方 | [grill-with-docs](https://aihero.dev/skills-grill-with-docs)，如果没有 codebase 则用 [grill-me](https://aihero.dev/skills-grill-me) |
| 是一个你想 test-first 的具体行为，没有 spec | 直接 [tdd](https://aihero.dev/skills-tdd) |
| 已经构建好了，你想让它被检查 | 直接 [code-review](https://aihero.dev/skills-code-review) |

同一个 session 的情况值得点名。如果计划只活在对话线程里，调用时就说清楚；如果来源是 OpenSpec，传入 change name 和本次要实现的 `tasks.md` group，避免把整个 change 一次吞下。

## Prerequisites

`implement` 提交到你当前所在的 branch。它不会创建分支，也不会问。开始之前确认你正处于你想要工作落在其上的 branch。

OpenSpec tasks 来自 [to-tickets](https://aihero.dev/skills-to-tickets) 时，开始前读取同一 change 的 proposal、delta specs、design 和 tasks。Tracker ticket 仍由 [setup-skills](https://aihero.dev/skills-setup-skills) 配置；两种输入不要混淆。

## What one run does

一次运行是五个节拍，按顺序：

1. 读取选定 task group、ticket 或 spec，厘清 seams。
2. 在预先认可的 seams 上驱动 [tdd](https://aihero.dev/skills-tdd)，一次一个 red-green 切片。
3. 频繁 typecheck，边走边运行单个测试文件。
4. 最后把完整测试套件跑一遍。
5. 运行 [code-review](https://aihero.dev/skills-code-review)。
6. OpenSpec 输入只勾选实际完成的 checkboxes，然后提交到当前 branch。

一次运行覆盖一个 task group 或 tracker ticket。[to-tickets](https://aihero.dev/skills-to-tickets) 产出的 `tasks.md` groups 是 tracer-bullet 垂直切片，大小按装进一个全新的 [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) 来定，所以预期节奏是：清空 context、implement 一个 group、勾选已完成 tasks、提交、再清空。

## Pre-agreed seams

这个 skill 赖以运行的观念是 **seam**：你在其上观察行为的公开边界，而不伸手进去。测试活在 seams 上。在写任何代码之前就认可一个 seam、并在其上工作，正是让测试保持持久的原因，因为底下的实现可以被重写，而测试不必跟着变动。

"pre-agreed" 这个词在做实打实的工作，它同时也是这个 skill 最薄弱的一个关节。`implement` 内部没有任何东西去认可 seams。`tdd` 才是发问的那个 skill，它拒绝在未经确认的 seam 上写测试。所以在实践中，认可要么发生在 spec 的上游，要么发生在运行的第一次对话里。如果哪里都没发生，前置条件就永远不会触发，运行会悄悄变成"就是把代码写了"。在 spec 中指名 seams 正是阻止这一点的方法。

## Common questions

**它完成了，但我的工作项仍然没有更新。**

OpenSpec 输入应在实现、测试和 review 都通过后勾选本次完成的 `tasks.md` checkboxes；相邻任务保持未完成。Tracker ticket 的关闭仍由用户或 tracker workflow 处理，`implement` 不会自行关闭远端 issue。

**我可以一次指向所有 task groups，或者并行运行几个吗？**

不行。一次调用，一个 task group 或 ticket。跨队列的批量派发和 [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) 扇出都不存在。在同一个 checkout 里并排运行多个 `/implement` sessions 会共享 working directory、index 和 HEAD；需要并行时由调用方提供隔离的 worktrees 和调度，而不是让本 skill 猜测安全边界。

**它可以开 pull request 而不是 commit 吗？**

不是内建的。它直接提交到当前 branch，这让几个人觉得太急切：代码在他们有机会验证它能工作之前就落地了。没有任何配置 flag，也没有 PR 模式。人们会在调用里覆盖它（"commit 到一个 branch 并开一个 PR"），或者通过编辑他们本地的那份 skill 副本来覆盖。

**`code-review` 说它看不到我的变更。**

`code-review` 审查 `git diff <fixed-point>...HEAD`，那排除了 staged 和 working-tree 的变更。`implement` 在提交之前运行它，所以除非已经存在一个中间 commit，否则那个 diff 里就没有任何东西可审查。多人报告过这一点，而且双方都未修复。先 commit，再对着你分支出去的那个点做 review。

另外，有些人刻意完全不想要运行内的 review，因为一个审查自己刚写的代码的 agent 会偏向自己的方案。在一个全新的 session 里对着一个 fixed point 运行 [code-review](https://aihero.dev/skills-code-review) 是合法的替代方案，也正是那个 skill 把它的两个轴线放在独立的 sub-agents 里运行的原因。

**一个 task group 烧掉了 150k tokens。我用错了吗？**

很可能是 slice 太大。一次运行要做 codebase 探索、red-green loops、完整测试和 review；杠杆在上游：在 [to-tickets](https://aihero.dev/skills-to-tickets) 中把 `tasks.md` groups 调到能装进一个 fresh window。单个 group 反复超限时拆分 vertical slice，而不是调高 effort。

**在一个全新 session 里跑 `/implement #2`，却处理了完全无关的东西。**

`#2` 会对照 agent 能看到的任何编号列表来解析，而在一个全新 session 里，那可能是一个 todo 文件、一个 checklist、或另一份工作列表，而不是配置好的 tracker。解析是自信式的，而不是 fail-closed 的，所以这个错误在它开始之前并不明显。传入完整引用——issue URL 或 `owner/repo#2`——并让它开始之前先跟你确认标题。

## It's working if

- session 以读取 task group、ticket 或 spec 并复述它将构建什么来开场，而不是问你该构建什么。
- 你能在 trace 里看到一次真实的 `/tdd` 调用，而不只是在 diff 里出现测试。
- Typecheck 和单个测试文件在运行期间反复执行，完整套件在临近结束时跑一次。
- 运行在你当前 branch 上到达一次 commit，而你无需提示它继续。
- diff 是一个 task group 或 ticket 分量的变更：一条完整 vertical slice，而不是几个 groups 被扫成一堆。

## Where it fits

`implement` 是 main chain 的 build step，倒数第二：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它的邻居是 [to-tickets](https://aihero.dev/skills-to-tickets)——产出它所消费的 OpenSpec tasks；[tdd](https://aihero.dev/skills-tdd)——它在每个 seam 上内部驱动它；以及 [code-review](https://aihero.dev/skills-code-review)——它在提交之前运行它。它位于 planning 下游并信任已确认的 specs、design 和 tasks，不重新打开方案。

这份信任正是 [wayfinder](https://aihero.dev/skills-wayfinder) 在 [to-spec](https://aihero.dev/skills-to-spec) 处并入这条 chain、而不是把它的地图直接循环进 `implement` 的原因。只有当场得出 effort 确实很小时，才从一张地图直接去 `implement`。

当你不确定自己身处哪个 flow 时，[ask-matt](https://aihero.dev/skills-ask-matt) 是覆盖全集的 router。
