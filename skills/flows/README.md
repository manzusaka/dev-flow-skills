# Flows

围绕 OpenSpec planning 与 issue tracker 的规划和交付流程。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[setup-skills](./setup-skills/SKILL.md)** - 为 tracker-based flows 配置 issue tracker、triage labels 与 domain docs 布局。
- **[triage](./triage/SKILL.md)** - 通过 triage roles state machine 推进 issues。
- **[wayfinder](./wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 issue tracker 上的 decision tickets 共享 map，逐一解决直到通往 destination 的路清晰。
- **[to-spec](./to-spec/SKILL.md)** - 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 `proposal.md`。
- **[to-tickets](./to-tickets/SKILL.md)** - 读取 OpenSpec proposal，经过架构 grilling 补齐 delta specs、design 与 tracer-bullet tasks。

## Model-invoked

当前没有 model-invoked skills。
