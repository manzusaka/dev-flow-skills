# Flows

围绕 issue tracker 的规划和交付流程。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[setup-skills](./setup-skills/SKILL.md)** - 为 flows 配置 issue tracker、triage labels 与 domain docs 布局。每个 repo 运行一次。
- **[triage](./triage/SKILL.md)** - 通过 triage roles state machine 推进 issues。
- **[wayfinder](./wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 issue tracker 上的 decision tickets 共享 map，逐一解决直到通往 destination 的路清晰。
- **[to-spec](./to-spec/SKILL.md)** - 把当前对话整理成 spec 并发布到 issue tracker。
- **[to-tickets](./to-tickets/SKILL.md)** - 把 plan、spec 或 conversation 拆成 tracer-bullet tickets，每个 ticket 声明 blocking edges——本地文件中用文本表示，真实 tracker 上用 native blocking links。

## Model-invoked

当前没有 model-invoked skills。
