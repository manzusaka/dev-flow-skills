# Matt Pocock Skills

由 Claude Code 加载的一组 agent skills（slash commands 和 behaviors）。Skills 按 bucket 组织；OpenSpec flows 消费 `/setup-skills` 建立的 artifacts。

## Language

**OpenSpec change**:
位于 `openspec/changes/` 的一次未归档变更，由 proposal、delta specs、design 与 tasks 共同描述从意图到实现计划的完整契约。
_Avoid_: spec issue, ticket stack

**Task group**:
**OpenSpec change** 的 `tasks.md` 中一个编号分组；在 `to-plan` 产物中，每个 group 是适合单次 agent session 的 tracer-bullet vertical slice。
_Avoid_: ticket, blocking issue

**Decision record**:
`wayfinder` 的工作单元：`docs/wayfinding/<map-name>/` 下一个独立的 markdown 文件，承载的问题需要通过 decision 解决，而不是要执行的 build slice。**Decision** qualifier 把它与 implementation ticket 区分开来；`wayfinder` 会先引入完整术语，之后再简称 record。

**Trace**:
**OpenSpec change** 的执行轨迹：change 目录下的 `trace.md`。由 `implement` 创建并写入、`finalize-spec` 追加，记录下游步骤需要且无法重推导的运行时事实（review fixed point、最终提交、审查结果、归档路径）。
_Avoid_: execution log

## Relationships

- 一个 wayfinder **map** 包含多个 **Decision records**
- 一个 **OpenSpec change** 包含多个按依赖顺序排列的 **Task group**
- 一个 **OpenSpec change** 包含至多一份 **trace**（`trace.md`）
