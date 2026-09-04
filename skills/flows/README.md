# Flows

围绕 OpenSpec planning 的规划和交付流程。

## User-invoked

只有在你显式输入名称时才能调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[setup-skills](./setup-skills/SKILL.md)** - 初始化一个 repository 的工程前置：spect CLI、agent instructions 与 CONTEXT、ADR、OpenSpec 脚手架。
- **[wayfinder](./wayfinder/SKILL.md)** - 把超出单个 agent session 的大块工作规划成 `docs/wayfinding/` 下的 decision records 共享 map，逐一解决直到通往 destination 的路清晰。
- **[grill-with-docs](./grill-with-docs/SKILL.md)** - 追问式访谈，同时构建项目的 domain model、打磨术语，并内联更新 `CONTEXT.md` 与 ADRs。
- **[to-spec](./to-spec/SKILL.md)** - 把当前对话整理成 OpenSpec change proposal，创建兼容的变更元数据与 `proposal.md`。
- **[to-plan](./to-plan/SKILL.md)** - 读取 OpenSpec proposal，经过架构 grilling 补齐 delta specs、design 与 tracer-bullet tasks。
- **[implement](./implement/SKILL.md)** - 实现 OpenSpec change 或 spec 中指定的工作：按 `tasks.md` checkbox 状态续做，收尾统一提交并以 `/code-review` 审查。
- **[archive](./archive/SKILL.md)** - 归档已完成的 OpenSpec change：沉淀知识、生成摘要、委托 `spect archive` 合并规格，并把本次 change 的提交压成单个 commit。

## Model-invoked

当前没有 model-invoked skills。
