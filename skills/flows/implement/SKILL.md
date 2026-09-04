---
name: implement
description: "实现 OpenSpec change 或 spec 中指定的工作：按 tasks.md checkbox 状态续做，收尾时统一提交并以 `/code-review` 审查。"
disable-model-invocation: true
---

# Implement

实现用户在 OpenSpec change 或 spec 中指定的工作。调用形式是 `/implement [change-name]`；来源是裸 spec 或对话内计划时，直接说明即可。上游敲定的内容就是输入：没有访谈，不提出不同方案，不重新打开计划。

边界：只写入实现代码与 `tasks.md` 勾选；不创建分支、不做 checkpoint 提交、不归档 change；一次调用对应一个 change，并行需调用方提供隔离的 worktrees。`spect` 缺失或报错时停止并报告，不代为安装。

## Process（OpenSpec 输入）

### 1. Resolve the change

传入 `change-name` 且 exact match 时直接选择。否则运行 `spect list --json` 列出 active changes 让用户选择；没有 exact match 时按相关度展示候选让用户确认，不静默选择近似结果。

### 2. Gate on planning

运行 `spect status --change <change-name> --json`：`tasks.md` 缺失或 planning 未完成时停止，指向 `/to-plan <change-name>`。`skip_specs: true` 的 change 不要求 specs。

### 3. Load context

运行 `spect instructions apply --change <change-name>`，按输出的上下文清单读取 proposal、delta specs、`design.md` 与 `tasks.md`。

### 4. Read the state

按 `tasks.md` checkbox 与工作区状态判定状态，并向用户复述：

| 状态 | 去向 |
| --- | --- |
| 存在未勾选任务 | 进入 Step 5 |
| 全部勾选，有未提交变更 | 跳到 Step 6 |
| 全部勾选，工作区干净 | 跳到 Step 7 |

### 5. Implement

先复述 seams：以 `specs/**/*.md` 的 Scenarios 为主要测试锚点，参考 `design.md` Decisions 中已确认的 test seams；两处都没有时警告，由 `/tdd` 当场发问，不硬停。

然后在未勾选任务上驱动 `/tdd`，优先级按依赖顺序与代码现状判断：

- red-green 循环、vertical slice、seam 纪律全部遵循 `/tdd`。
- 每完成一项任务即时勾选对应 checkbox，只勾实际完成的。
- 中断后再次调用，凭 checkbox 与工作区状态从断点续做。

### 6. Verify and commit

运行完整测试套件，失败则回到 Step 5。通过后记录当前 `HEAD` 为 review fixed point（change 完成前不做任何提交，`HEAD` 全程不动），把代码与 `tasks.md` 勾选作为一次提交落在当前 branch，commit message 引用 `<change-name>`。

### 7. Review and finish

对 fixed point 调用 `/code-review`，显式传入 delta specs 与 proposal 作为 Spec 轴来源。「全部勾选且已提交」的重入态没有本次记录的 fixed point：取 commit message 最老引用 `<change-name>` 的提交的 parent，解析不出来时询问用户。

有 findings 就修复、通过测试后再次提交；review 只跑一轮。完成后报告 change 完成。

## Process（spec / 对话输入）

1. 复述范围，记录当前 `HEAD` 为 fixed point。
2. 在可确认的 seams 上驱动 `/tdd`；seams 缺失时由 `/tdd` 当场发问。
3. 完整测试套件通过后提交到当前 branch。
4. 对 fixed point 调用 `/code-review`，显式传入 spec 作为 Spec 轴来源；有 findings 就修复、测试后再次提交，review 只跑一轮。

## 注意

- 不做 checkpoint 提交：change 完成前代码与勾选都在工作区，中断的进度只能凭 `tasks.md` checkbox 状态恢复。
- 开始前确认当前 branch 就是工作要落的地方。
- 归档（`spect archive`）不在本 skill 范围。
