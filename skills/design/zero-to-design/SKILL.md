---
name: zero-to-design
description: |
  交互式设计流程：定义产品、收集参考、选择方向、迭代首屏、扩展页面、跨页打磨，沉淀 DESIGN.md。适用于新产品设计、现有产品重设计、已有系统新增页面或组件、审查 UI，以及从代码库提取设计基线。已有系统优先核对并复用设计资产；没有可用资产时探索源码和运行界面。
  中文触发语包括“zero-to-design”“从 0 设计”“已有系统接入”“设计新页面”“设计新组件”“提取 DESIGN.md”“品牌设计流程”“设计方向选择”“生成 DESIGN.md”。
triggers:
  - "zero-to-design"
  - "从 0 设计"
  - "已有系统接入"
  - "设计新页面"
  - "设计新组件"
  - "提取 DESIGN.md"
  - "品牌设计流程"
  - "设计方向选择"
  - "生成 DESIGN.md"
---

# zero-to-design · 交互式设计流程

把产品想法或已有系统中的设计需求转为可运行预览和 `DESIGN.md`。面向后端工程师与非设计师：解释每个设计选择的理由，并给出具体选项。

## 全程约束

- `{end}` 是产品端目录，如 `user-app`、`admin`，不同于 Web/H5 平台目录。用户指定 `docs/prototype/` 下的一级目录；名称只接受小写字母、数字和中间连字符。未指定时先询问；不要从其他端状态推断。中文别名可记在该端 `design/state.md`。
- 以用户第一条消息的语言进行对话，并用于全部产物的可见文字、标题和字段名。文件名、目录名、CSS 自定义属性、token、代码标识符、组件库和字体家族名保留英文。同一产物不混用界面语言。
- 用户明确要求优先；已核实的现有设计资产优先于新造规则；其他设计选择来自产品定义与参考。已批准决定不得在后续阶段悄悄改变。
- 项目范围是允许读写设计文件的本地仓库或应用。运行 URL 只能作为界面证据，不决定写入目录。只产出用户要求的平台；已有项目沿用其技术栈。
- 阶段 N 的产物以 `0N-` 开头。最终规范为 `docs/prototype/{end}/DESIGN.md`；`tokens.css` 和资源位于该端 `design/` 下。
- 本 skill 的设计能力随目录分发，不扫描或要求安装其他设计 skill。

## 开始与恢复

读取状态、检查源码或创建产物前，先确定用户意图、本地项目和 `{end}`。明确的新产品、完整重设计、已有系统新增页面/组件、继续或重启请求直接采用；只有模式不清才聚焦询问。当前目录明显是目标项目时直接使用；用户只给 URL 且当前目录不是对应项目时，先询问本地目录。仅当运行界面检查可增加证据时询问运行 URL；不要重复问已明确的模式或位置。

确定范围与端目录后，简要说明本次入口模式、本地项目、端目录及可选运行 URL。除非用户明确重启，第一项文件操作必须检查并读取该端的 `docs/prototype/{end}/design/state.md`（若存在）。从其中的当前阶段恢复，不重跑已完成阶段，不再次提出已拒绝方向，不违反已锁定决定。若状态已完成且用户要新增页面或组件，进入[扩展模式](references/workflow/extension.md)。没有状态时，新产品从阶段 1 开始；已有系统先读[已有系统接入](references/workflow/existing-system.md)。

用户要求重新开始或完整重设计且已有状态时，保护旧状态，不原地重置或覆盖。默认在 `<project>/design-restarts/<YYYYMMDD-HHmmss>/` 建立独立工作区，所有本 skill 产物都写入该工作区对应的 `docs/prototype/{end}/`；用户指定其他工作区则按其路径。若用户选择在原项目继续，先把原有 `docs/prototype/{end}/` 非破坏性复制到获批备份/归档路径并核实存在，再写新产物。原项目可作为实现参考，运行 URL 永远不是写入范围。

## 按当前阶段读取

先选入口模式并读实际状态，再只读取当前阶段的流程说明。阶段完成且满足该阶段批准门槛后才读下一阶段；不要预读未来阶段、整个 `references/`、所有模板或 `docs/case/`。当前阶段文件会指向需要的设计能力参考。原生平台相关任务按需读取 [iOS](references/native/ios.md)、[Android](references/native/android.md)、[原生适配](references/native/adapt.native.md) 或 [原生审查](references/native/audit.native.md)。用户明确指定额外 skill 时，可在不覆盖已锁定决定的前提下使用。

| 情况 | 当前流程文件 |
| --- | --- |
| 新产品或重设计，阶段 1–7 | [产品定义](references/workflow/phase-1.md) → [参考](references/workflow/phase-2.md) → [方向](references/workflow/phase-3.md) → [首屏](references/workflow/phase-4.md) → [页面扩展](references/workflow/phase-5.md)（可选）→ [跨页打磨](references/workflow/phase-6.md)（可选）→ [设计系统](references/workflow/phase-7.md) |
| 已有系统新增页面/组件，尚未完成盘点 | [已有系统接入](references/workflow/existing-system.md)，再按目标进入[阶段 5](references/workflow/phase-5.md)或[阶段 6](references/workflow/phase-6.md) |
| 已完成系统新增页面/组件 | [扩展模式](references/workflow/extension.md)及其指向的阶段 5/6 规则 |
| 已有未完成状态 | 状态记录的当前阶段文件；创建或结构性修复状态时读[状态管理](references/workflow/state.md) |

已有系统的单个页面窄范围打磨直接进入阶段 6；新增核心页面或多页面扩展进入阶段 5。除非要求新方向或完整重设计，不重跑阶段 1–4。阶段 5、6 可依任务跳过；完成设计系统时进入阶段 7。

## 阶段交接

每个阶段只询问本阶段尚不明确的决定。前一阶段被用户跳过的问题依据现有信息推断，在对应文档标记 `agent-inferred`；后续阶段读取前一阶段产物，不跨阶段补问。阶段 1 的 `01-product.md`、阶段 2 的 `02-references.md` 和最终 `DESIGN.md` 需要用户明确批准；回答含糊、推断不确定或尚有待决问题时先确认。阶段 3 需用户选择方向，阶段 4–6 按各自文件收集反馈。内容清楚且已获必要批准时直接推进，不另问“是否进入下一阶段”。

创建状态或修复其结构时读[状态管理](references/workflow/state.md)。每个阶段完成后、当前打磨维度变化后，以及阶段 5/6 每次候选选择后更新当前端的状态文件；文件清单只列适用且实际存在的产物。每次阶段交接以及标记完成前，运行 `node <skill>/scripts/doctor.mjs --target <项目或重启工作区> --folder <端目录名>`，其中 `<skill>` 是本 `SKILL.md` 所在目录；脚本支持 `--json`。核对发现项后修正状态或产物。Node.js 不可用时按同一清单人工核对并记录。脚本不能替代运行界面、原生应用和用户路径观察。任一文件生成失败时先检查当前阶段的参考、路径和写入权限；doctor 失败时区分脚本错误、文件缺失与真实发现项。
