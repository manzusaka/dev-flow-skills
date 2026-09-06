# Initialize agent docs

本 reference 只由 `/setup-skills` 使用。目标 repository root 已由顶层流程确定；本阶段把仓库级 shared instructions 收敛到 `AGENTS.md`，让 root `CLAUDE.md` 通过 `@AGENTS.md` 导入它，并只承载 Claude Code 专属内容。

## Initialize

### 1. Explore the repository

- 找出 root 与 nested `AGENTS.md`、`CLAUDE.md`；记录每份文件的作用域和 import 关系。
- 阅读能改变 agent 决策的高信号材料：README、manifests、workspace config、测试/构建入口、架构或贡献文档等。
- 从目录结构与配置中验证事实。把 nested instructions 留在原作用域，不将局部规则提升到 root。
- 把现有 instructions 分类为 **shared**、**Claude-only**、**scoped** 或 **unresolved**，并记录来源和含义。

完成条件：每份 instruction 都有来源、作用域和分类。

### 2. Resolve ambiguity

使用 repository 中的 primary sources 解决重复和陈旧内容。两条仍有效的 instructions 冲突，或无法判断某条 Claude rule 是否应共享时，展示冲突和可选方案，让用户决定。保留尚未解决的原文。

完成条件：没有会被本次编辑掩盖的未决冲突。

### 3. Build `AGENTS.md`

写入前读取 [AGENTS.md template](../assets/AGENTS.md)。它定义可选 sections 的职责；删除 template comments、placeholders 和不适用的空 sections。

| 当前状态 | 动作 |
| --- | --- |
| 两个文件都没有 | 从 template 生成 `AGENTS.md`，只写 exploration 已证实且会改变 agent 行为的内容。 |
| 只有 `AGENTS.md` | 以它为 shared instructions 的 source of truth，补入已证实的必要缺口。 |
| 只有 `CLAUDE.md` | 新建 `AGENTS.md`，把 shared 内容移入。 |
| 两个文件都有 | 以 `AGENTS.md` 为基线，整合 `CLAUDE.md` 中尚未覆盖的 shared 内容。 |

编辑要求：

- 保留用户写下且仍有效的约束、原因和 context pointers。
- 以 manifests、scripts、config 和目录结构作为可直接查询事实的 source of truth。
- 每个 pointer 同时说明材料是什么，以及什么任务分支需要读取它。
- verification 只记录 canonical completion commands、必要顺序或非显而易见的前置条件。
- 只有缺口会实质改变结果时才询问用户。

完成条件：所有 shared instructions 在 root `AGENTS.md` 中只有一个权威版本，没有空 section 或 placeholder。

### 4. Normalize `CLAUDE.md`

写入前读取 [CLAUDE.md template](../assets/CLAUDE.md)。创建或更新 root `CLAUDE.md`，让首个有效内容恰好是：

```markdown
@AGENTS.md
```

之后仅保留 `## Claude Code` 中的 Claude Code 专属 instructions，例如 Claude tools、permission modes、hooks、plan mode、Claude-only commands 或 `.claude/` 行为。已有 import 原地规范化；没有专属内容时只保留 `@AGENTS.md`。

完成条件：Claude Code 会加载 `AGENTS.md`，`CLAUDE.md` 没有 shared instructions 的重复副本，也没有丢失 Claude-only requirements。

### 5. Summarize the changes

整理 created、merged、preserved 和 unresolved 内容，供顶层 Report 使用。

完成条件：两份 root 文档已写入，内容清单完整。

## Final verification

在写入完成后重新读取最终文件，并检查：

- `CLAUDE.md` 恰好导入一次 `@AGENTS.md`，且 import 位于任何 instruction 之前。
- shared、Claude-only 与 nested scoped 内容保持正确归属。
- steps 有可检查的 completion criteria；references 按任务分支渐进披露。
- context pointers 有明确 trigger，同一含义只有一个 source of truth。
- Markdown 没有空 section、unfinished placeholder、template residue 或冲突规则。
- 在 Git repository 中，diff 没有修改本阶段范围外的文件。

完成条件：所有检查通过；剩余问题都需要用户决定且已明确报告。
