---
name: using-git-worktrees
description: 适用于开始需要与当前 workspace 隔离的 feature 工作，或在执行 implementation plan 之前——确保通过原生工具或 git worktree fallback 存在一个隔离的工作区。
---

# Using Git Worktrees

## Overview

确保工作发生在一个隔离的 workspace 里。优先使用你的平台原生的 worktree 工具。只有在没有原生工具可用时，才 fallback 到手动 git worktrees。

**Core principle:** 先检测已有的隔离。然后使用原生工具。然后 fallback 到 git。绝不与 harness 对抗。

**Announce at start:** "我正在使用 using-git-worktrees skill 来搭建隔离的工作区。"

## Step 0: Detect Existing Isolation

**在创建任何东西之前，先检查你是否已经在一个隔离的 workspace 里。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** 在 git submodule 内部，`GIT_DIR != GIT_COMMON` 同样为真。在得出"已经在 worktree 里"的结论之前，先确认你不在 submodule 中：

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不在 submodule 中）：** 你已经在一个 linked worktree 里。跳到 Step 2（Project Setup）。不要再创建一个 worktree。

连同 branch 状态一起报告：
- 在 branch 上："已处于 `<path>` 的隔离工作区，branch 为 `<name>`。"
- Detached HEAD："已处于 `<path>` 的隔离工作区（detached HEAD，由外部管理）。完成时需要创建 branch。"

**如果 `GIT_DIR == GIT_COMMON`（或在 submodule 中）：** 你在一个普通的 repo checkout 里。

用户是否已经在你的 instructions 里表明过 worktree 偏好？如果没有，先征求同意再创建 worktree：

> "需要我搭建一个隔离的 worktree 吗？它能保护你当前的 branch 不被改动。"

尊重任何已声明的偏好，不要再问。如果用户不同意，就在原地工作并跳到 Step 2。

## Step 1: Create Isolated Workspace

**你有两种机制。按这个顺序尝试。**

### 1a. Native Worktree Tools (preferred)

用户已经要求了隔离的 workspace（Step 0 的同意）。你手头已经有创建 worktree 的方式了吗？它可能是名为 `EnterWorktree`、`WorktreeCreate` 的工具、`/worktree` 命令，或者 `--worktree` flag。如果有，使用它，然后跳到 Step 2。

原生工具会自动处理目录放置、branch 创建和清理。在有原生工具时使用 `git worktree add`，会制造你的 harness 看不见也管不了的 phantom state。

只有在没有原生 worktree 工具可用时，才进入 Step 1b。

### 1b. Git Worktree Fallback

**仅当 Step 1a 不适用时使用**——你没有原生 worktree 工具可用。用 git 手动创建 worktree。

#### Directory Selection

遵循以下优先顺序。用户显式的偏好永远优先于观察到的文件系统状态。

1. **检查你的 instructions 里是否声明了 worktree 目录偏好。** 如果用户已经指定，直接使用，不要再问。

2. **检查是否已有项目本地的 worktree 目录：**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   如果找到，使用它。如果两者都存在，`.worktrees` 优先。

3. **如果没有其他指引**，默认使用项目根目录下的 `.worktrees/`。

#### Safety Verification (project-local directories only)

**创建 worktree 之前，必须先验证目录已被 ignore：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果没有被 ignore：** 加入 .gitignore，commit 这个变更，然后继续。

**Why critical:** 防止意外把 worktree 内容 commit 进 repo。

#### Create the Worktree

```bash
# Determine path based on chosen location
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** 如果 `git worktree add` 因权限错误（sandbox 拒绝）而失败，告诉用户 sandbox 阻止了 worktree 创建，你改为在当前目录工作。然后在原地运行 setup 和 baseline tests。

## Step 2: Project Setup

自动检测并运行合适的 setup：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Step 3: Verify Clean Baseline

运行 tests，确保 workspace 从干净的状态开始：

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**如果 tests 失败：** 报告失败，询问是继续还是先调查。

**如果 tests 通过：** 报告就绪。

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| 情况 | 行动 |
|-----------|--------|
| 已在 linked worktree 中 | 跳过创建（Step 0） |
| 在 submodule 中 | 按普通 repo 处理（Step 0 guard） |
| 有原生 worktree 工具 | 使用它（Step 1a） |
| 没有原生工具 | Git worktree fallback（Step 1b） |
| `.worktrees/` 存在 | 使用它（验证已被 ignore） |
| `worktrees/` 存在 | 使用它（验证已被 ignore） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 检查 instruction file，然后默认 `.worktrees/` |
| 目录未被 ignore | 加入 .gitignore + commit |
| 创建时权限错误 | Sandbox fallback，在原地工作 |
| Baseline tests 失败 | 报告失败 + 询问 |
| 没有 package.json/Cargo.toml | 跳过依赖安装 |

## Common Rationalizations

| 借口 | 现实 |
|--------|---------|
| "我显然不在 worktree 里——不用检查" | 运行 Step 0。Harness 创建的隔离和 submodule 都能骗过肉眼；检测命令能一锤定音。 |
| "`git worktree add` 比找原生工具更快" | 原生工具（例如 `EnterWorktree`）掌管目录放置、branching 和清理。绕过它是第一大错误——它会制造你的 harness 看不见也管不了的 phantom state。 |
| "worktree 目录肯定已经被 ignore 了" | 运行 `git check-ignore`。未被 ignore 的 worktree 目录会把整棵树 commit 进 repo。 |
| "目录名叫什么都行" | 显式的 instructions 优先于已有的项目本地目录，已有的项目本地目录优先于 `.worktrees/` 默认值。 |
| "workspace 是全新的——baseline tests 可以等会儿再跑" | 不干净的 baseline 会让之后的每个失败都含义模糊。现在就运行 tests；是否在失败的情况下继续，由你的人类伙伴决定。 |
