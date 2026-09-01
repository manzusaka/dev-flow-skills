---
name: setup-skills
description: 初始化一个 repository 的工程前置，包括 spect CLI、agent instructions、CONTEXT、ADR 与 OpenSpec 脚手架。在首次使用 flows 前显式运行。
disable-model-invocation: true
---

# Setup Skills

为一个 repository 建立本仓库 flows 依赖的工程前置。每次调用只处理一个 repository；重复运行时从头执行完整序列，由各阶段保留已经完成的内容。

## Process

### 1. Resolve one repository

确定 workspace 中的 repository roots。单 repository 或 monorepo 直接继续；存在多个彼此独立的 repositories 时，列出它们并让用户选择一个。本次后续阶段始终使用同一个 repository root。

完成条件：唯一的目标 repository root 已确定。

### 2. Check required skills

确认当前可用 skills 中存在：

- `/init-cli`

缺失时列出缺失项并停止，不修改用户目录或目标 repository。

完成条件：required skill 可调用。

### 3. Initialize the CLI

运行 `/init-cli`。它负责检查、安装或更新随本仓库分发的 `spect`，并在写入用户目录前取得所需授权。

只有 `/init-cli` 确认兼容版本可以执行时才继续。用户拒绝、环境不兼容或命令失败时停止。

完成条件：与当前 `/init-cli` 随附版本一致的 `spect` 可以执行。

### 4. Initialize agent docs

读取 [references/init-agent-docs.md](references/init-agent-docs.md)，对目标 repository 依次执行其中的 **Initialize** 与 **Final verification**。

完成条件：root `AGENTS.md` 与 `CLAUDE.md` 已按 shared、Claude-only 和 nested scope 规则完成初始化或整合，并通过 Final verification 的全部检查。

### 5. Initialize flow docs

读取并执行 [references/init-flow-docs.md](references/init-flow-docs.md)。该阶段复用第 3 步已经完成的 CLI 门禁。

完成条件：OpenSpec 初始化与校验成功，root `CONTEXT.md`、root `docs/adr/` 和要求的 `openspec/` 结构存在，既有内容得到保留。

### 6. Report

任一阶段失败、被用户拒绝或遇到不兼容状态时立即停止，不回滚已经成功完成的阶段，并准确报告 completed、failed 与 not started。

只有前五个阶段全部满足完成条件时才报告 setup 成功。列出 CLI version，以及 agent docs、flow docs 中 created、preserved 与 validated 的路径。
