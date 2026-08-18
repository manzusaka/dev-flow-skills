---
name: init-flow-docs
description: 初始化项目的 workflow docs。适用于新建或整理领域上下文、ADR 与 OpenSpec 目录时；保留现有事实并补齐 CONTEXT.md、docs/adr/、OpenSpec schema 和 templates。
---

# Initialize flow docs

为一个项目建立三类相互补充的事实来源：`CONTEXT.md` 记录领域语言与业务规则，`docs/adr/` 保存架构决策，`openspec/` 管理当前行为与尚未完成的变更。

## Process

### 1. Explore the workspace

先确定 workspace 中的 repository roots。单仓库直接继续；存在多个彼此独立的 repositories 时，列出它们并让用户确认本次范围。

对目标 repository：

- 阅读 root instructions、README、manifests、workspace config，以及能说明模块边界的高信号目录和文档。
- 检查现有 `CONTEXT.md`、`CONTEXT-MAP.md`、`docs/adr/` 与其他 ADR 位置。
- 检查 `openspec/config.yaml`、`openspec/schemas/`、`openspec/specs/`、`openspec/changes/` 和已有 artifacts。
- 识别项目实际使用的领域术语、业务规则与架构边界；从代码和配置验证已有文档中的事实。

完成条件：目标 root 已确定，现有 flow docs 与项目结构已盘点，每条准备写入 `CONTEXT.md` 的内容都能追溯到现有文档、代码、配置或用户陈述。

### 2. Prepare `CONTEXT.md`

读取 [CONTEXT template](./assets/CONTEXT.md)，以它作为结构和内容边界。

如果 root `CONTEXT.md` 已存在，生成一个临时优化版本：

- 保留所有仍有效的领域术语与业务规则，不改变它们的含义。
- 为同一概念选一个 canonical term；只在项目确实使用了其他称呼时记录 `_Avoid_`。
- 定义只说明概念是什么；业务规则写成可观察约束或 invariant。
- 移除重复表述；实现细节继续由代码、ADR 或 OpenSpec design artifacts 承载。
- 证据冲突时保留原文件，展示冲突并让用户决定，不静默选择。

如果 `CONTEXT.md` 不存在，不预先编造领域内容；初始化脚本会复制空白模板。

完成条件：已有 `CONTEXT.md` 的临时版本保留了全部已验证事实且符合模板；新文件场景不包含推测的术语或规则。

### 3. Initialize through the script

运行：

```bash
bash <skill-directory>/scripts/init-flow-docs.sh <project-root>
```

已有 `CONTEXT.md` 时，把上一步的临时文件交给脚本：

```bash
bash <skill-directory>/scripts/init-flow-docs.sh <project-root> --context-source <prepared-context-file>
```

脚本只补齐以下结构；现有 ADR、OpenSpec artifacts、配置、schema 与 templates 原地保留：

```text
<project-root>/
├── CONTEXT.md
├── docs/
│   └── adr/
└── openspec/
    ├── config.yaml
    ├── schemas/
    │   ├── schema.yaml
    │   └── templates/
    │       ├── proposal.md
    │       ├── spec.md
    │       ├── design.md
    │       └── tasks.md
    ├── specs/
    └── changes/
        └── archive/
```

不要创建示例 ADR、capability spec 或 change；这些文件必须表达真实决定或行为。

完成条件：脚本成功退出，且除用户通过 `--context-source` 明确提供的新 `CONTEXT.md` 外，没有覆盖既有文件。

### 4. Verify

确认目标 root 中：

- `CONTEXT.md` 存在，且已有内容场景的领域事实与业务规则均被保留。
- `docs/adr/`、`openspec/specs/` 与 `openspec/changes/archive/` 均存在。
- `openspec/config.yaml` 存在；新建文件使用 `schema: spec-driven`，原有文件及其自定义 schema 保持不变。
- `openspec/schemas/schema.yaml` 与 `openspec/schemas/templates/` 中的四个 artifact templates 均存在；初始化前已存在的版本保持不变。
- `git diff --check` 通过，diff 中没有范围外改动。

直接解析 `openspec/schemas/schema.yaml`，确认它是有效 YAML，且其中每个 artifact 的 `template` 都能在 `openspec/schemas/templates/` 中找到。项目已有 OpenSpec specs 或 changes 且 `openspec-cn` CLI 可用时，再运行 `openspec-cn validate --all --strict --no-interactive`；空目录没有 artifact 可验证时跳过该命令。

完成条件：目录与文件检查全部通过；存在可验证 artifacts 时，OpenSpec 严格校验也通过。
