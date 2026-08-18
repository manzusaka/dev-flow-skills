---
name: init-agent-docs
description: 初始化或整合仓库级 agent instructions。适用于 workspace 初建、用户要求创建或整理 AGENTS.md / CLAUDE.md，或两个文件内容重复、分歧、缺失时；保留嵌套文档的局部作用域。
---

# Initialize agent docs

把仓库级共享 instructions 收敛到 `AGENTS.md`，让根目录 `CLAUDE.md` 通过 `@AGENTS.md` 导入它，并只承载 Claude Code 专属内容。

## Process

### 1. Explore the workspace

先确定 workspace 中的 repository roots。单仓库或 monorepo 直接继续；存在多个彼此独立的 repositories 时，列出它们并让用户确认本次范围。

对范围内每个 repository：

- 找出 root 与 nested `AGENTS.md`、`CLAUDE.md`；记录每份文件的作用域和 import 关系。
- 阅读能改变 agent 决策的高信号材料：README、manifests、workspace config、CI、测试/构建入口、架构或贡献文档，以及 `.claude/` 中的 rules、hooks 和 settings。
- 从目录结构与配置中验证事实。把 nested instructions 留在其原作用域，不将局部规则提升到 root。
- 记录现有 instruction 的来源、含义与分类：**shared**、**Claude-only**、**scoped** 或 **unresolved**。

完成条件：每个 repository root 的文档状态已确定，且每条现有 instruction 都有来源与分类。

### 2. Resolve ambiguity

用仓库中的 primary source 解决重复和陈旧内容。若两条仍有效的 instruction 冲突，或无法判断某条 CLAUDE rule 是否应共享，先展示冲突与可选方案，再让用户决定。保留尚未解决的原文，不静默丢弃。

完成条件：没有会被本次编辑掩盖的未决冲突。

### 3. Build `AGENTS.md`

写入前读取 [AGENTS.md template](./assets/AGENTS.md)。它规定可选 section 的职责，不要求保留空 section；删除所有 template comments 与 placeholders。

按 root 当前状态处理：

| 当前状态 | 动作 |
| --- | --- |
| 两个文件都没有 | 从 template 生成 `AGENTS.md`。只写 exploration 已证实、会改变 agent 行为的内容。 |
| 只有 `AGENTS.md` | 以它为共享 instructions 的 source of truth，补入 exploration 发现的必要缺口。 |
| 只有 `CLAUDE.md` | 新建 `AGENTS.md`，把 shared 内容移入；Claude-only 内容留给下一步。 |
| 两个文件都有 | 以 `AGENTS.md` 为基线，将 `CLAUDE.md` 中尚未覆盖的 shared 内容整合进去。 |

编辑要求：

- 保留用户写下且仍有效的约束、原因和 context pointers。
- 以环境作为 scripts、目录结构与配置的 source of truth；只缓存环境中无法廉价查到的事实。
- 每个 pointer 同时说明材料是什么，以及什么任务分支需要读取它。
- verification 只记录 canonical completion commands、必要顺序或非显而易见的前置条件。
- 没有证据的项目事实保持缺省；只有缺口会实质改变结果时才询问用户。

完成条件：所有 shared instructions 只在 `AGENTS.md` 中保留一个权威版本，且没有空 section 或 placeholder。

### 4. Normalize `CLAUDE.md`

写入前读取 [CLAUDE.md template](./assets/CLAUDE.md)。无论文件原先是否存在，都创建或更新根目录 `CLAUDE.md`；它的首个有效内容必须是：

```markdown
@AGENTS.md
```

之后仅保留 `## Claude Code` section 中的 Claude Code 专属 instructions，例如 Claude tools、permission modes、hooks、plan mode、Claude-only commands 或 `.claude/` 行为。已有 import 原地规范化，不追加第二个 import。没有专属内容时，只保留 `@AGENTS.md`，不创建空 heading。

完成条件：Claude Code 会加载 `AGENTS.md`；`CLAUDE.md` 中没有 shared instruction 的重复副本，也没有丢失现有 Claude-only 要求。

### 5. Review with `/writing-for-agents`

运行 `/writing-for-agents` 审查并修改两份文档。逐项确认：

- steps 有可检查的 completion criteria；reference 按使用分支 progressive disclosure。
- context pointers 有明确 trigger，概念 co-located，单一含义只有一个 source of truth。
- 删除 environment caches、stale rules、no-ops、重复含义和 template residue。
- 正向描述目标行为；hard guardrail 保留具体边界。

完成条件：review 中发现的每个问题都已修改，或作为需要用户决定的未决项明确报告。

### 6. Verify and report

重新读取最终文件，并检查：

- `CLAUDE.md` 恰好导入一次 `@AGENTS.md`，且 import 位于任何 instruction 之前。
- shared、Claude-only 与 nested scoped 内容保持正确归属。
- Markdown 无空 section、unfinished placeholder 或冲突规则。
- 在 git repository 中运行 `git diff --check`，并检查 diff 没有改动范围外的文件。

报告创建、合并和保留的内容，以及任何必须由用户决定的剩余问题。
