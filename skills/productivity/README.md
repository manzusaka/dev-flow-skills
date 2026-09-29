# Productivity

通用工作流工具，不限于代码。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[handoff](./handoff/SKILL.md)** - 把当前对话压缩成 handoff document，让另一个 agent 可以继续。

## Model-invoked

模型或用户都可以调用（description 包含足够丰富的触发措辞，方便模型自动找到它们）。

- **[grilling](./grilling/SKILL.md)** - 围绕计划、decision 或 idea 持续访谈用户，直到 decision tree 的每个分支都被解决。
- **[to-prd](./to-prd/SKILL.md)** - 以产品经理视角访谈本次需求，确认企业级表格化单文档 PRD 后保存到 `docs/prds/`，从 v0.1 开始保留版本与历史变化。
- **[writing-for-agents](./writing-for-agents/SKILL.md)** - 为 agent 编写文档：skills、`AGENTS.md`/`CLAUDE.md`，以及任何 agent 通过指针触达的文档。
