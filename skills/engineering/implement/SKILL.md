---
name: implement
description: "实现 OpenSpec change 或 spec 中指定的工作：对可观察行为和核心业务规则的变更采用 TDD，按 tasks.md checkbox 状态续做，收尾时统一提交并以 `/code-review` 审查。"
disable-model-invocation: true
---

# Implement

实现用户在 OpenSpec change 或 spec 中指定的工作。调用形式是 `/implement [change-name]`；来源是裸 spec 或对话内计划时，直接说明即可。上游敲定的内容就是输入：没有访谈，不提出不同方案，不重新打开计划。

边界：只写入实现代码、`tasks.md` 勾选与 `trace.md`；不创建分支、不做 checkpoint 提交、不归档 change；一次调用对应一个 change，并行需调用方提供隔离的 worktrees。`spect` 缺失或报错时停止并报告，不代为安装。

## Process（OpenSpec 输入）

### 1. Resolve the change

传入 `change-name` 且 exact match 时直接选择。否则运行 `spect list --json` 列出 active changes 让用户选择；没有 exact match 时按相关度展示候选让用户确认，不静默选择近似结果。

### 2. Gate on planning

运行 `spect status --change <change-name> --json`：`tasks.md` 缺失或 planning 未完成时停止，指向 `/to-plan <change-name>`。`skip_specs: true` 的 change 不要求 specs。随后若 `spect instructions implement` 返回 `blocked`，同样停止并报告原因。

### 3. Load context

运行 `spect instructions implement --change <change-name>`，按输出的上下文清单读取 proposal、delta specs、`design.md` 与 `tasks.md`；若存在 `docs/architecture/<change-name>-stack.md`，也读取该文档。

### 4. Read the state

按 `tasks.md` checkbox 与工作区状态判定状态，并向用户复述：

| 状态 | 去向 |
| --- | --- |
| 存在未勾选任务 | 进入 Step 5 |
| 全部勾选，有未提交变更 | 跳到 Step 6 |
| 全部勾选，工作区干净 | 跳到 Step 7 |

### 5. Implement

对最小、可观察的行为增量，以及稳定的业务规则、关键计算或状态转移函数的行为变更，先确定并复述测试边界：以 `specs/**/*.md` 的 Scenarios 为主要锚点，参考 `design.md` Decisions 中已确认的 test seams；两处都没有时参考现有可调用接口和 tests，仍无法确定边界时询问用户。

然后在未勾选任务上按依赖顺序与代码现状实现。对上述行为变更，先读 [TDD 指引](references/tdd.md)，逐个观察 RED → GREEN；纯重构按该指引先确认当前行为测试为 GREEN、改后仍为 GREEN，纯文档或低影响编辑不强制先写测试。

- 适用 TDD 的任务在相关测试通过后才勾选 checkbox，只勾实际完成的。
- 中断后再次调用，凭 checkbox 与工作区状态从断点续做。

### 6. Verify and commit

运行项目约定的完整自动化测试套件，失败则回到 Step 5。通过后记录当前 `HEAD` 为 review fixed point（change 完成前不做任何提交，`HEAD` 全程不动），把代码与 `tasks.md` 勾选作为一次提交落在当前 branch，commit message 引用 `<change-name>`。

### 7. Review and finish

对 fixed point 调用 `/code-review`，显式传入 delta specs 与 proposal 作为 Spec 轴来源。「全部勾选且已提交」的重入态没有本次记录的 fixed point：先读 `trace.md` 中记录的 review fixed point；缺失时取 commit message 最老引用 `<change-name>` 的提交的 parent，解析不出来时询问用户。只有 `/code-review` 按双轴并行流程完成后才继续；无法执行时停止并报告，不以自审代替或记录 `pass`，重入后补跑审查。

有 findings 就修复；涉及可观察行为或核心业务规则缺陷的修复也按 [TDD 指引](references/tdd.md) 观察 RED → GREEN。完整测试套件通过后再次提交；review 只跑一轮。

在 `openspec/changes/<change-name>/trace.md` 写入（文件不存在则创建，已有 implement section 则更新）本次执行记录：

```text
## implement
- review fixed point: <Step 6 记录的 HEAD>
- commit: <最终提交 SHA>
- code-review: <pass | findings 已修复摘要>
```

完成后报告 change 完成。

## Process（spec / 对话输入）

1. 复述范围，记录当前 `HEAD` 为 fixed point。
2. 对最小、可观察的行为增量，以及稳定的业务规则、关键计算或状态转移函数的行为变更，先读 [TDD 指引](references/tdd.md)，确定测试边界并逐个观察 RED → GREEN；边界不清时询问用户。纯重构先确认当前行为测试为 GREEN、改后仍为 GREEN；纯文档或低影响编辑不强制先写测试。
3. 项目约定的完整自动化测试套件通过后提交到当前 branch。
4. 对 fixed point 调用 `/code-review`，显式传入 spec 作为 Spec 轴来源；无法按双轴并行流程完成时停止并报告，不以自审代替。涉及上述行为缺陷的 findings 按 TDD 指引修复，完整测试套件通过后再次提交，review 只跑一轮。

## Handoff Next Step

OpenSpec change 完成后，下一步由用户显式运行 `/finalize-spec <change-name>` 收尾变更。来源是裸 spec 或对话内计划时无此步骤。

## 注意

- 不做 checkpoint 提交：change 完成前代码与勾选都在工作区，中断的进度只能凭 `tasks.md` checkbox 状态恢复。
- 开始前确认当前 branch 就是工作要落的地方。
- 归档（`spect archive`）不在本 skill 范围。
