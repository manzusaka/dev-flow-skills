## What it does

`wayfinder` 接手一个对单个 agent [session](https://www.aihero.dev/ai-coding-dictionary/session) 来说太大的 effort——一个你能说出其 **destination**、却还看不见路径的想法——并把它绘制成 `docs/wayfinding/` 下的一张由 **decision records** 组成的 **shared map**，然后一次一个地解决它们，直到路径清晰。

它做 planning，不做执行。每个 record 都承载一个问题，其解决是一个 decision，而不是一个待执行的 build 切片；当在有人去构建这东西之前再没有什么需要决定时，map 就完成了。这一条规则就是 wayfinder decision 与普通实现 [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket) 的区别，也是 agent 最常打破的规则——因此执行豁免只能由人类在 chart 时写进 map 的 Notes，agent 不得修改 Notes。当 map 清除时，wayfinder 交接；它不会继续进入代码。

## When to reach for it

你通过输入 `/wayfinder` 调用它——[agent](https://www.aihero.dev/ai-coding-dictionary/agent) 不会自行触发。

它是整套流程中最重、最密的一条，因此触发条件很窄：effort 必须真正大于单个 agent session 所能容纳的范围，而且通往 destination 的路线必须仍然有 fog。这个分工是干净的：`/grill-with-docs` 用于单 session 规划，`/wayfinder` 用于多 session 规划。

| 你面前有什么 | 运行什么 |
| --- | --- |
| 一个范围明确、一次就能敲定的 feature | [grill-with-docs](https://aihero.dev/skills-grill-with-docs)，没有 codebase 时直接 [grilling](https://aihero.dev/skills-grilling) |
| 一个 greenfield 项目，或一个跨越许多 session 的 build，路径仍不清晰 | `/wayfinder` |
| 一条该决定的事已经做完的 thread | [to-spec](https://aihero.dev/skills-to-spec)——直接跳过 map |
| 一张已清除的 wayfinder map | [to-spec](https://aihero.dev/skills-to-spec)，然后用 `to-plan` 完成 OpenSpec planning |
| 一个已经长到太大的现有 session | 说 "hand off to `/wayfinder`"——[handoff](https://aihero.dev/skills-handoff) 既架桥进入 map，也架桥离开 map |

Greenfield 不是必要条件。Wayfinder 也常规地用于 legacy 和半成品的 codebase，而且在那里它可以说更锐利，因为很多 fog 是"这里已经成立的事实"，而不是"我们应该做什么"。

## Prerequisites

Wayfinder 不需要任何外部配置：map 与 records 直接写进 `docs/wayfinding/<map-name>/`，committed 进 repo，随代码一起演进。没有 setup 步骤，也没有 tracker 依赖——frontier 就是目录里 open 且 unblocked 的 records，列一下目录就能看见。

## The map, the fog, and the frontier

**map** 是 `docs/wayfinding/<map-name>/` 目录：`map.md` 是索引，每个 decision 是一个独立的 record 文件。它是一个 **index, not a store**——一个 decision 恰好存在于一个地方（它的 record），map 只摘要并链接它。一个 session 以低分辨率加载 map，并按需放大到各个 record——这正是一个 map 可以不断增长、却不必让每个 session 为它的全部历史买单的原因。

map 上承载四样东西：

- **Destination**——到达这张 map 尽头的样子。命名它是 charting 的第一件事，发生在任何 record 存在之前，因为 destination 固定了每个 decision 据以衡量的 scope。
- **Decisions so far**——每个已 resolved 的 record 一行，各自链接到细节真正所在的地方。
- **Not yet specified**——**fog of war**。你能看出即将到来、却还无法精确表述的 decisions。fog 与 record 的判别标准，是你现在能否*精确地说出*问题，而不是你能否回答它。解决一个 record 会清除它前方的 fog，把现在可以明确说明的内容 **graduate** 成新的 records。
- **Out of scope**——被判定超出 destination 的工作。Fog 永远只*朝着* destination 聚集，因此 out-of-scope 的工作被移出路线，永不 graduate。

**Frontier** 是那些 open、unblocked 的 records——已知世界的边缘。依赖关系写在每个 record 的 **Blocked by** 里，一个 record 的所有 blockers 都 resolved 后它才进入 frontier。在整个过程中 records 都以名字引用，绝不是一个光秃秃的文件名；一墙 `01-foo.md` 在叙述中无法阅读。

## The four decision types

每个 record 都标注一个类型，并且要么是 **[HITL](https://www.aihero.dev/ai-coding-dictionary/human-in-the-loop)**——与一个为自己发声的人类一起完成——要么是 **[AFK](https://www.aihero.dev/ai-coding-dictionary/afk)**，由 agent 独自驱动。一个 HITL record 只能通过 live exchange 解决；一个自答 [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) 问题的 agent 已经把它破坏了。

| Type | Mode | 何时使用 | 如何解决 |
| --- | --- | --- | --- |
| `grilling` | HITL | 默认。这个问题可以通过谈清楚来敲定。 | [grilling](https://aihero.dev/skills-grilling) 加上 [domain-modeling](https://aihero.dev/skills-domain-modeling)，在一个全新的 session 中 |
| `prototype` | HITL | "这应该长什么样"或"这该怎么表现"——一个谈话无法敲定的问题。 | [prototype](https://aihero.dev/skills-prototype)，把构建出的 artifact 作为 asset 从 record 链接过来 |
| `research` | AFK | 工作目录之外的一个事实阻塞了一个 decision。 | 一个 [research](https://aihero.dev/skills-research) [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent)，在 charting 时启动，并在一个 `research/<name>` branch 上并行烧掉 |
| `task` | Either | 没有要决定的事，但手动工作阻塞了一个 decision——开通访问权限、注册一个服务、移动数据以便看清它的形状。 | 能由 agent 独自完成的就独自完成，否则给人类一份精确的 checklist |

`task` 是唯一一种 *做* 而非 *决定* 的类型，它靠解除一个 decision 的阻塞来赢得自己的位置——绝不靠交付一块 destination。这也是实践中出错最多的类型：agent 把它理解为实现步骤，开始在 map 里写产品代码。

Research 是 *每个 session 一个 record* 的唯一例外。

## Common questions

**这和 `/grill-with-docs` 有什么不同？我应该先启动哪个？**
看 session 数量，而不是项目大小。`/grill-with-docs` 是单 session 规划；wayfinder 是多 session 规划。如果你能在一次 conversation 里装下整件事，grilling 是更便宜也更好的工具，而 wayfinder 在这种情况下确实更慢、更密。社区已经沉淀了一句简短的总结：只有当工作放不进单个 session 时，wayfinder 才有意义。这是 wayfinder 被问得最多的问题，而且一直被问，因为那两段描述并没有告诉你自己的任务在这条线上位于何处——你必须自己判断 session 数量。

**当它询问 "destination" 时，是指这次 session 的终点，还是所有事情的终点？**
整张 map——整张 map 的 destination，而不只是最初的 session。这个问题读起来很含糊，因为 wayfinder 从定义上就是一个多 session 工具，所以 session 范围的答案永远没有意义。典型的 destination 包括一份要交接的 [spec](https://www.aihero.dev/ai-coding-dictionary/spec)、一个在规划开始前要锁定的 decision、一个 proof of concept，或像数据迁移那样就地完成的变更。

**map 已经清除了。为什么我还需要 `/to-spec`——wayfinder 不是已经写了 spec 吗？**
没有。Wayfinder 的 records 是 decision records，而到 map 关闭时它们也全部关闭了。剩下的是满满一张互相链接的 decisions，这还不是 OpenSpec change。[to-spec](https://aihero.dev/skills-to-spec) 把这些 decisions **逐个**收束——每个 decision 对应一个 OpenSpec change 的 `proposal.md`——再由 `to-plan` 补齐 delta specs、design 和 tasks。把 map 直接循环进 [implement](https://aihero.dev/skills-implement) 会跳过收束并丢掉相互链接的细节。只有当某个 decision 结果确实很小时，才直接进入实现。

**我的 agent 在 wayfinder session 中途开始写生产代码了。**
这是这个 skill 最常被报告的失败，背后曾经确实有个洞：Wayfinder 的 "plan, don't do" 默认可以在 map 的 **Notes** 中被覆盖——而 Notes 是 agent 写的，于是约束和它的豁免住在同一个文件里，而该文件归受约束的一方所有。一位用户看着 agent 把 "this map carries execution" 写进它自己的 Notes，然后在后续 session 里把它读回来当作自己的许可证，在线上服务器上继续构建。这个洞已经堵上：执行豁免只能由**人类在 chart 时**写入 Notes，agent 在任何时候都不得修改 Notes 节。剩余的口诀仍然有用：对你没有亲自 chart 的任何 map，都要读它的 Notes；把实现放在自己的 session 里；把任何看起来像 build 切片的 `task` 当作打错了类型。

**我 chart 了 27 个 records，等我做到第十三个时，剩下的已经不再有意义了。**
这是真实且被反复报告的结果，出自一份 field report 的原话。Wayfinder 的默认本能是全面规划，而一张后面的 records 建立在前面 records 所推翻的假设之上的 map，正是这个 skill 被指责的 waterfall 陷阱。有两件事可以反制它。把 map 的范围限定在一个有边界的 destination，而不是整个产品——实践者们一致报告，限定在单个明确 epic 上的 map 比一个铺开的 "implement V1" 表现更好，而且规划非常大的东西从一开始就不是目标——分小步交付才是。还有：积极地 [prototype](https://www.aihero.dev/ai-coding-dictionary/prototyping)——路线之所以能保持实时，完全是因为在实现依赖它之前，不确定性就被廉价而具体的 artifact 冲刷掉了。Wayfinder 是 "prototypemaxxing"，不是 "planmaxxing"——把 prototype 拉满，而不是把 plan 拉满。

**我能同时处理几个 records 吗？**
Frontier 就是用来向你展示哪些是可领取的，每个 record 的 Blocked by 也保证了并行工作在纸面上是安全的。但在实践中，一次一个才是更安全的默认。同时推进两个 grilling records 的用户，会在一个 session 里被问到刚刚在另一个 session 里回答过的问题，因为这些 session 之间没有共享 [context](https://www.aihero.dev/ai-coding-dictionary/context)。prototype records 上还有一个已知的缺口：有报告称 agent 构建了三种 UI 变体，自己选了一个，然后 resolve 了 record——选择权是你的，而这个 skill 目前没有把这一点说得足够响亮。如果你确实要并行推进，先自己审查一遍依赖关系。

**grilling 太耗人了。每个问题都有三段那么长。**
这是对 wayfinder 最尖锐的现行抱怨，而且还没有解决。一位用户给出的拆解：冗长本身就会导致 decision 疲劳，而长度剥掉了提问者*为什么*问这个问题，于是随着 map 变长，你失去了从 decision 到 decision 的链条。这种冗长看起来更像是当前这批 [models](https://www.aihero.dev/ai-coding-dictionary/model) 的属性，而不是 skill 的属性，而且还没有修复落地。流传中的实践者缓解手段：使用更低的 [reasoning effort](https://www.aihero.dev/ai-coding-dictionary/effort)，并在你的全局 `CLAUDE.md` 里放一条口语化的指令。无论如何都要做好花真功夫的准备——wayfinder 要求你投入的思考量不是缺陷，它几乎就是整个工具的意义所在。

**一个我已经 resolved 的 decision 结果证明是错的。我是编辑旧 record，还是新建一个？**
没有官方指引，而 agent 的本能帮不上忙：它倾向于绕开那个坏 decision 去设计，而不是挑战它，所以你只能手动掌舵。真正有效的是直接告诉 wayfinder 什么变了——它会更新 map、修订受影响的 records，并在已 resolved 的 records 上修订 Resolution。map 中途的 scope 变更是可以恢复的。一张你*设计*成会变的 map，则是一种 scope 的坏味道。

**`decision-mapping` 去哪了？**
它就是当前这个 skill，在 v1.1 中改名为 `wayfinder`，并以 `/wayfinder` 调用。"Decision map" 是行话，而且也不准确，因为四种类型里只有一种真正是 decision。这次重构给了 skill 一套连贯的词汇——destination、fog of war、frontier、map——而不是在顶上再叠一层生造的词。不过单位保留了 "decision" 这个词：**decision record** 就是 wayfinder 工作单元的称呼，正是为了阻止人们把它读成实现 ticket。

## It's working if

- 在任何一个 record 存在之前，destination 就已写下并达成一致。
- 每个 open record 读起来都是一个问题。任何读起来像 "build the X" 的 record，要么是打错了类型，要么属于 map 的下游。
- frontier 就是目录里 open 且 unblocked 的 records——列一下目录就能看出哪些可拿。
- 一个 session 解决一个 record，把答案写进它的 Resolution，并在 map 的 *Decisions so far* 上留下一行。然后它就停下来。
- **Not yet specified** 会随时间缩小。一片 graduate 成 record 的 fog 会从该小节消失，而不是同时存在于两个地方。
- 当开场的那次 breadth-first grill 完全没浮现出 fog 时，skill 会停下来，告诉你这个 effort 小到可以跳过 map。
- 完成 map 的那个 session 把你引向逐个的 `/to-spec`，而不是一个 pull request。

## Where it fits

`wayfinder` 是一个 **situational on-ramp**，而不是默认的正门。以 grill 为起点的 idea → ship 链条仍然是大多数工作的起点；当 idea 大到无法装进一个 session 时，你才爬上 wayfinder，而它会在 [to-spec](https://aihero.dev/skills-to-spec) 处重新汇入那条链条——decisions 逐个收束成 OpenSpec changes——因为一张已清除的 map 是交接，而不是继续构建。

在底层，它主要是穿着 wayfinder 调度外衣的其他 skills：[grilling](https://aihero.dev/skills-grilling) 和 [domain-modeling](https://aihero.dev/skills-domain-modeling) 解决默认的 record 类型，[prototype](https://aihero.dev/skills-prototype) 解决谈话解决不了的 records，而 [research](https://aihero.dev/skills-research) 以 subagent 运行，让它的阅读永远不会落进你的 session。[handoff](https://aihero.dev/skills-handoff) 是进出的桥——从一个自我膨胀的 conversation 进入 map，或在 session 中途冒出支线任务时离开 map。至于其他一切，[ask-matt](https://aihero.dev/skills-ask-matt) 会在整套中为你引路。
