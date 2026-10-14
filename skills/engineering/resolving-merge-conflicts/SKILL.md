---
name: resolving-merge-conflicts
description: "适用于需要解决正在进行的 git merge/rebase 冲突时。"
---

1. **查看当前 merge/rebase 状态**。检查 git history 和冲突文件。

2. **为每个冲突找到 primary sources**。深入理解每个变更为什么产生，以及原始意图是什么。阅读 commit messages，检查 PRs 和原始需求记录。

3. **解决每个 hunk。** 尽可能保留双方意图。若二者不兼容，选择符合本次 merge 目标的一方，并记录 trade-off。**不要**发明新行为。始终解决冲突；不要 `--abort`。

4. 发现项目的 **automated checks** 并运行它们，通常是 typecheck、tests、format。修复 merge 引入的问题。

5. **完成 merge/rebase。** Stage 所有内容并 commit。若正在 rebase，继续 rebase 流程直到所有 commits 都完成。
