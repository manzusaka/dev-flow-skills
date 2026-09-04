## What it does

`setup-skills` 为一个 repository 建立本仓库 flows 依赖的工程前置：安装或更新 `spect`（精简版 OpenSpec CLI），初始化或整合 root `AGENTS.md` 与 `CLAUDE.md`，并搭建 `CONTEXT.md`、`docs/adr/` 与 `openspec/` 脚手架。

它是一个 prompt 驱动的 skill，而不是一个确定性的脚本。它探索仓库的现有结构与内容，提出它发现的内容，并在写入任何东西之前等你确认。重复运行是安全的：每个阶段保留已经完成的内容。

## When to reach for it

你通过输入 `/setup-skills` 调用它——[agent](https://www.aihero.dev/ai-coding-dictionary/agent) 不会自行触发。它被刻意标记为不可调用，所以没有其他 skill 能替你触发它。

**每个使用本套 flows 的 repo 运行一次**，在首次使用 flows 之前。一个已经进行到项目一半的 repo 也是运行它的好地方；这个 skill 会读取已经存在的内容，之前的工作不会浪费。

## Prerequisites

它写入你运行它的那个 repo：

| 它写入 | 位置 |
| --- | --- |
| `spect` CLI | 由 `/init-cli` 安装，随 skill 分发，无需联网 |
| root `AGENTS.md` | shared instructions 的唯一权威版本 |
| root `CLAUDE.md` | 以 `@AGENTS.md` 导入，只承载 Claude Code 专属内容 |
| OpenSpec 脚手架 | `openspec/`（`spect init`） |
| root `CONTEXT.md` 与 `docs/adr/` | 无 `CONTEXT-MAP.md` 的仓库创建 `CONTEXT.md`；已有 `CONTEXT-MAP.md` 的仓库结构原样保留 |

全部都是已提交的 markdown 与仓库结构。没有 user-level 或 global 模式：一切就在 repo 里，所以每个 repo 都有自己的副本。

## Common questions

**更新 skills 之后我需要重新运行它吗？**

重复运行是安全的：流程从头执行完整序列，但每个阶段保留已经完成的内容，所以它同时充当修复与校验。如果某个下游 flow 开始以文档描述不同的方式行事，重新运行就是廉价的修复。

**它写进了 `CLAUDE.md`，但我用的是 Codex。**

这曾是上游版本的已知缺口，现在按构造解决：shared instructions 收敛进 root `AGENTS.md`，root `CLAUDE.md` 的首个有效内容恰好是 `@AGENTS.md` 导入，只承载 Claude Code 专属内容。Codex 读取 `AGENTS.md`，不会再写到没人读的地方。

**我能在这里配置其他 skills 的行为吗——[grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) 节奏、问题格式、语气？**

不能。它只建立前置，不配置行为。有人直接要求让它成为 per-user preferences 的归属地，而长期以来的回答是：skills 保持 opinionated：*"Config is death."* Preferences 属于你的 `AGENTS.md` / `CLAUDE.md`，作为普通指令，每个 skill 都已经会读取它。

**我能把 config 放在 `~/.claude` 而不是提交到每个 repo 吗？**

今天不行。有一个来自跨多个 repo 运行这些 skills 的人的开放请求，也不存在 user-level 模式。每个 repo 各自携带自己的前置文件。

## It's working if

- `/init-cli` 随附版本的 `spect` 可以执行。
- root `AGENTS.md` 是 shared instructions 的唯一权威版本，没有空 section 或 placeholder；root `CLAUDE.md` 以 `@AGENTS.md` 开头。
- `openspec/` 结构存在并通过校验，`docs/adr/` 存在；无 `CONTEXT-MAP.md` 的仓库有 root `CONTEXT.md`，有 `CONTEXT-MAP.md` 的仓库结构原样保留。
- skill 文件本身没有任何变化。如果 setup 编辑了一个 `SKILL.md`，那一定出错了。

## Where it fits

`setup-skills` 是 flows 的 **run-once setup**，而不是 chain 中的一个步骤。它为后续一切铺设前置：`spect` 之于 `to-spec` 与 `to-plan`，`AGENTS.md` 之于所有 skills 的运行时指令，`CONTEXT.md` 与 ADRs 之于 [grill-with-docs](https://aihero.dev/skills-grill-with-docs) 与 [domain-modeling](https://aihero.dev/skills-domain-modeling)，OpenSpec 脚手架之于 changes。至于下一步该用哪个 skill，[ask-matt](https://aihero.dev/skills-ask-matt) 为整套工具路由。
