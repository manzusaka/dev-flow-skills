---
name: wayfinder
description: 把单个 agent session 装不下的一大块工作规划成 `docs/wayfinding/` 下的 decision records shared map，并逐一解决，直到通往 destination 的路清晰。
disable-model-invocation: true
---

一个松散想法出现了：它太大，单个 agent session 装不下，而且被 fog 包围；从这里到 **destination** 的路还看不见。Wayfinding 的目标是找到这条路，而不是朝 destination 猛冲。这个 skill 会把路径绘制成 repo 中 `docs/wayfinding/` 下的一张 **shared map**，然后逐个处理 **decision records**——它们承载需要决策才能解决的问题，而不是要执行的 build slices——直到路线清晰。

不同 effort 的 destination 不同，而为它命名是 charting 的第一个动作；它塑造每个 decision。它可能是一份要 hand off 并迭代的 spec、一个必须在 planning 前确定的 decision，或 data-structure migration 之类原地完成的 change。Map 与领域无关：engineering work、course content，或任何符合这个形状的事项都可以。

## Plan, don't do

Wayfinder 默认用于 **planning**：每个 decision record 解决一个 decision；当别人动手前已经没有任何事情需要决定、路径完全清晰时，map 才算完成。想直接做工作的冲动通常表示你已经到达 map 边缘，该 hand off 了。否则只产出 decisions，不产出 deliverables。

执行豁免只有一个入口：**人类在 chart 时写入 map 的 Notes**——例如声明这个 effort 包含 execution。Agent 在任何时候都不得修改 Notes 节：约束和它的豁免不能住在归被约束方所有、并由它维护的地方。没有人类写下的豁免时，这个默认值没有例外。

## Refer by name

每个 map 和每个 decision record 都有自己的名字。在所有给人看的内容里，包括叙述和 map 的 Decisions-so-far，都用名字引用它，不要只写裸文件名或编号。一堵 `01-foo.md, 02-bar.md` 很难读；名字一眼就能看懂。文件名和相对路径不会消失，它们被包在名字的 link 里面，但不单独替代名字。

## The Map

Map 是 `docs/wayfinding/<map-name>/` 目录：`map.md` 是 canonical artifact，每个 decision 是同目录下独立的 markdown 文件。

Map 是 **index**，不是 store。它列出已经做出的 decisions，并指向保存细节的 record 文件；一个 decision 只存在一个地方，也就是它的 record。因此 map 不复述细节，只给 gist 和 link。

### The map body

Map 是低分辨率的全局视图，每个 session 加载一次。未解决的 decisions 不复述在里面；它们是目录里未解决的 record 文件，列出来就能找到。

```markdown
## Destination

<what reaching the end of this map looks like — the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a decision.>

## Notes

<domain; skills every session should consult; standing preferences for this effort. 只有人类在 chart 时可以写入；agent 不得修改本节。>

## Decisions so far

<!-- the index — one line per resolved record: enough to judge relevance, then zoom the link for the detail the record holds -->

- [<decision 标题>](./01-<slug>.md) — <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't record yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; never graduates -->
```

### Decision records

每个 decision 都是 map 目录下一个独立的 markdown 文件，文件名形如 `01-<slug>.md`，编号即创建顺序。文件结构：

```markdown
# <decision 标题>

**Type:** `research` | `prototype` | `grilling` | `task`
**Blocked by:** <decision 名字列表；没有就删掉本行>

## Question

<the decision or investigation this record resolves，大小控制在一个 100K token agent session 内>

## Resolution

<解决后填写：答案本身，以及后续 decisions 依赖的事实>
```

没有 `## Resolution` 的 record 是 **open** 的。一个 record 的所有 blockers 都 resolved 后，它就是 **unblocked**；**frontier** 是 open 且 unblocked 的 records，也就是已知世界的边缘。

答案不写进 Question，而是在 resolution 时记录（见 [Work through the map](#work-through-the-map)）。解决 decision 时产生的 assets 从 Resolution 链接出去，不粘贴进来。

## Decision Types

每个 decision 都是 **HITL**（human in the loop，与能代表自己发言的人类一起处理）或 **AFK**（agent 独立驱动）。HITL decision 只能通过 live exchange 解决；agent 绝不能替人类回答。一旦 grilling agent 自问自答，它就已经坏了。

- **Research**（AFK）：阅读 documentation、third-party APIs，或 knowledge bases 等 local resources，找出某项 decision 正在等待的事实。交给 `/research` **subagent** 解决。当需要当前 working directory 外的知识时使用。
- **Prototype**（HITL）：通过 cheap、rough、concrete artifact 提高讨论 fidelity，例如 outline、rough take、stub，或通过 /prototype skill 写 UI/logic code。Prototype 作为 asset 链接。当核心问题是 "how should it look" 或 "how should it behave" 时使用。
- **Grilling**（HITL）：Conversation。默认类型。始终调用 /grilling 和 /domain-modeling skills。
- **Task**（HITL 或 AFK）：做出 _decision_ 前必须完成、但本身没有要 decide、prototype 或 research 的 manual work。例如注册服务以评估其 API、配置访问权限、移动数据以看清 shape。这是唯一会 _do_ 而不是 decide 的类型；它凭借解锁 decision 而存在，而不是交付 destination。Agent 能独立完成时采用 AFK，否则给人类精确 checklist（HITL）。工作完成后 resolved；Resolution 记录做了什么，以及后续 decisions 依赖的事实（credentials location、new URLs、row counts 等）。

## Fog of war

Map 是 _有意_ 不完整的：不要描绘你还看不见的东西。Records 之外是 fog：那些你能感觉到以后会来的 decisions 和 investigations，但它们悬在仍未解决的问题之上，暂时还无法钉住。解决一个 record 会清掉它前方的一片 fog，把现在已经能说明的问题升级成新的 records；一次一个，直到通向目标的路清楚且没有 records 剩下。

Map 的 **Not yet specified** section 用来记录这种朦胧视野：怀疑中的问题、之后要回访的区域。这里是通往 destination、尚未探索的 frontier；所有内容都在 scope 内，只是还不够清晰，无法成为 record。可以按视野允许的粗细来写；它也是协作者阅读这个 effort 走向时的路标。

**Fog or record?** 测试标准是你现在能不能把问题说清楚，而不是现在能不能回答它。

- **Record when** 问题已经清晰，即使它被 blocked、现在不能处理。
- **Not yet specified when** 你还不能把它说得那么清楚。不要把 fog 预先切成 record-sized pieces：fog 比 record 粗，frontier 到达后，一片 fog 可能升级成多个 records，也可能一个都没有。

**Not yet specified** 排除已经决定的内容（Decisions so far）、已经是 live record 的内容，以及 out of scope 的内容（下一节）。

## Out of scope

Fog 只会聚集在通往 destination 的方向。Destination 固定 scope，因此超出它的工作是 **out of scope**，不是 fog，也不属于 **Not yet specified**。它写进 map 单独的 **Out of scope** section：你有意识地排除在这个 effort 之外的工作。决定它属于这里的是 scope，而不是 sharpness。

Out-of-scope work 永远不会 graduate；frontier 会停在 destination。只有重画 destination 时它才会回来，而且应成为新的 effort，不是 resumption。

把某事排除出 scope 是 scoping act，不是 route 上的一步。如果已有 record 被发现位于 destination 之外——charting 时被错误地划入 scope，或被某次 resolution 暴露——应把它移出 frontier，并在 **Out of scope** section 中留一行：gist 加上它为何 out of scope，并链接到该 record 文件。不要把它放进 **Decisions so far**；后者只记录真正走过的路线——scope 边界不是路线上的一步。

## Invocation

两种模式。无论哪种，**每个 session 绝不要 resolve 超过一个 decision record**——research records 除外。

### Chart the map

用户带着松散想法调用。

1. **Name the destination.** 运行 `/grilling` 和 `/domain-modeling` session，确定 map 要找到的 spec、decision 或 change。Destination 固定 scope，所以先解决它。
2. **Map the frontier.** 再 grill 一次，这次采用 **breadth-first**：覆盖整个空间，而不是深入一条 thread，浮现 open decisions 和现在可开始的 first steps。**如果没有 fog**，说明路径已经清晰，整个 journey 一个 session 就能完成，你不需要 map。停止并询问用户如何继续。
3. **Create the map**：创建 `docs/wayfinding/<map-name>/` 目录与 `map.md`，填好 Destination 和 Notes，Decisions-so-far 为空，把 fog 勾勒进 **Not yet specified**。Notes 由人类口述或确认——这是唯一可以写入执行豁免的时机，之后 agent 不得再动它。
4. **Create the decision records you can specify now**：每个一个文件，写好标题、Type、Blocked by 和 Question。Blocked by 把它们分成 frontier 和 blocked；现在还说不清的都留在 **Not yet specified**。
5. **启动 research subagents。** 对刚创建的每个 `research` record，并行启动一个 `/research` subagent 解决它；findings 保存在一次性的 `research/<name>` branch，并从 record 留下 context pointer。
6. 停止。Charting 是一个 session 的工作；不要在这个 session 中手动 resolve records。

### Work through the map

用户用 map 名字调用。Decision 是 **optional**；没有点名时，你选择下一个 decision，而不是用户选择。

1. 加载 **map**：读 `map.md`，低分辨率视图，而不是每个 record 正文。
2. 选择 record。用户点名就用它；否则按顺序拿第一个 frontier record。
3. Resolve it：按需 **zoom**，只在需要时读取相关或已 resolved record 的完整内容；调用 `## Notes` block 提到的 skills。不确定时用 `/grilling` 和 `/domain-modeling`。
4. 记录 resolution：把答案写进 record 的 `## Resolution`，并向 map 的 Decisions-so-far 追加一行 gist + link。
5. 添加新浮现的 records；把答案已经说清的 fog graduate 成 record，并从 **Not yet specified** 清掉每个已升级 patch，让它只作为新 record 存在。如果答案表明这个或其他 record 位于 destination 之外，将其 **rule out of scope**，而不是当作路线的一部分解决。如果这个 decision 使 map 其他部分失效，更新或删除那些 records。

## Hand off

当所有 records 都 resolved、没有 fog 剩下时，map 清除了。Wayfinder 在此交接，不进入执行：decisions **逐个**交给 `/to-spec`——每个 decision 收束成一个 OpenSpec change——再由 `/to-plan` 补齐 delta specs、design 和 tasks，然后进入 `/implement`。只有当某个 decision 后来发现确实很小时，才跳过 OpenSpec planning 直接实现。
