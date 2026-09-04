---
name: archive
description: "归档已完成的 OpenSpec change：沉淀知识、生成摘要、委托 `spect archive` 合并规格，并把本次 change 的提交压成单个 commit。"
disable-model-invocation: true
---

# Archive

归档用户在 OpenSpec change 中完成的工作。调用形式是 `/archive [change-name]`。上游是 `/implement`：实现、提交与审查都已完成，归档只做收尾——不重开计划，不修改实现代码，不重跑测试。

边界：只写入归档产物（规格合并、summary.md、CONTEXT.md/ADR 更新）与一次压缩提交；不合并回 base、不创建 PR（PR 由用户手动创建）、不丢弃工作、不清理 worktree。`spect` 缺失或报错时停止并报告，不代为安装。

## Process

### 1. Resolve the change

传入 `change-name` 且 exact match 时直接选择。否则运行 `spect list --json` 列出 active changes 让用户选择；没有 exact match 时按相关度展示候选让用户确认，不静默选择近似结果。不存在对应 change 时（上游来源是裸 spec 或对话内计划），报告"无可归档内容"并停止。

### 2. Gate on tasks

运行 `spect status --change <change-name> --json`：

- 全部任务已勾选 → 继续。
- 存在未勾选任务 → 列出未完成任务，警告但不阻塞，用户确认后继续。
- change 标记 `skip_specs: true` → 记下，步骤 5 传 `--skip-specs`。

### 3. Capture knowledge

调用 `/domain-modeling`，传入本次 change 的术语与决策线索（proposal.md、design.md、delta specs），对 `CONTEXT.md` 与 ADRs 做最终检查：打磨本次变更引入的术语，记录尚未写入的架构决策。

### 4. Write the summary

写入 `openspec/changes/<change-name>/summary.md`：

```markdown
# 变更摘要：<change-name>

## 构建内容
[一段话]

## 关键决策
- [决策]：[原因]

## 规格变化
- specs/<domain>/spec.md：新增 N 项、修改 N 项、删除 N 项

## 新建或更新的 ADR
- ADR-NNNN：[标题]

## 术语
- [术语]：[定义]

## 经验教训
- [洞察]
```

### 5. Archive the change

先统计本次 change 的 delta specs（ADDED / MODIFIED / REMOVED 需求数量），向用户展示将要发生的规格变动预览并请求确认。确认后运行：

```bash
spect archive <change-name> -y
```

`spect` 把 delta specs 合并进 `openspec/specs/`，并把变更目录移入 `openspec/changes/archive/<日期>-<change-name>/`。不要自行实现文件级合并。`skip_specs: true` 的 change 追加 `--skip-specs`。

### 6. Squash into one commit

从 `HEAD` 往回找 commit message 引用 `<change-name>` 的最老提交：

- 找到 → squash 范围为 [该提交的 parent .. HEAD] 加上未提交的归档产物。若范围内存在 message 不引用 `<change-name>` 的提交，列出它们并警告，用户确认后继续。然后：

```bash
git reset --soft <parent>
git add openspec/ <本次 /domain-modeling 写入的文件>
git commit  # 复用被压缩的最老 change commit 的 message
```

- 未找到 → 把未提交的归档产物提交为新提交，message 为 `chore: archive <change-name>`。

只提交本次 change 相关的文件（`openspec/` 目录与本次 `/domain-modeling` 写入的文件）；工作区中无关的未提交文件保持不动。

### 7. Report

向用户报告：单个提交的 SHA、归档路径、更新的 specs 列表、沉淀的知识摘要；提示 PR 由用户手动创建。

## 注意

- 任务未全部勾选不阻塞归档，但必须警告并经用户确认。
- 未经用户确认不得同步规格。
- 不得删除 change 目录；只允许 `spect archive` 的移动操作。
