# Matt Pocock Skills

由 Claude Code 加载的一组 agent skills（slash commands 和 behaviors）。Skills 按 bucket 组织；OpenSpec flows 消费 `/setup-skills` 建立的 artifacts。

## Language

**Issue tracker**:
托管某个 repo issues 的工具，例如 GitHub Issues、Linear、本地 `.scratch/` markdown 约定，或类似系统。`triage` 和 `wayfinder` 等 skills 会从中读取并写入。
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
**Issue tracker** 中的一项被跟踪工作单元，例如 bug、request 或 **Decision ticket**。
_Avoid_: ticket（仅在引用外部系统称其为 ticket，或指下面的 **Decision ticket** 时使用）

**OpenSpec change**:
位于 `openspec/changes/` 的一次未归档变更，由 proposal、delta specs、design 与 tasks 共同描述从意图到实现计划的完整契约。
_Avoid_: spec issue, ticket stack

**Task group**:
**OpenSpec change** 的 `tasks.md` 中一个编号分组；在 `to-tickets` 产物中，每个 group 是适合单次 agent session 的 tracer-bullet vertical slice。
_Avoid_: ticket, blocking issue

**Decision ticket**:
`wayfinder` 的工作单元：`wayfinder:map` 的一个 child **Issue**，承载的问题需要通过 decision 解决，而不是要执行的 build slice。**Decision** qualifier 把它与 implementation ticket 区分开来；`wayfinder` 会先引入完整术语，之后再简称 ticket。

**Triage role**:
在 triage 期间应用到 **Issue** 上的规范 state-machine label（例如 `needs-triage`、`ready-for-agent`）。每个 role 都会通过 `skills/flows/setup-skills/triage-labels.md` 映射到 **Issue tracker** 中真实的 label 字符串。

## Relationships

- 一个 **Issue tracker** 包含多个 **Issues**
- 一个 **Issue** 同一时间携带一个 **Triage role**
- 一个 **Decision ticket** 是 **Issue**（`wayfinder:map` 的 child）
- 一个 **OpenSpec change** 包含多个按依赖顺序排列的 **Task group**

## Flagged ambiguities

- “backlog” 过去同时表示托管 issues 的*工具*以及工具里的*工作集合*；已解决：工具称为 **Issue tracker**，“backlog” 不再作为 domain term 使用。
- “backlog backend” / “backlog manager” 已解决：统一收敛为 **Issue tracker**。
