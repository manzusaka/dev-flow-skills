# 阶段 7

按需读取 [audit](../audit.md) 与 [clarify](../clarify.md)。

**目标**：把 `DESIGN.draft.md` 固化为最终、可复用的 `DESIGN.md`。

**关键要求：**

- 以 `DESIGN.draft.md` 为输入，**不要**重新从预览源码提取。
- 阶段 5/6 更新过 draft 时，必须合并所有更新。
- 按 [DESIGN 模板](../../templates/DESIGN-template.md) 的十章骨架组织视觉、组件、布局、UX、工程约束和代理提示。阶段 4 的首屏交互、阶段 5 的 default/loading/empty/error、阶段 6 的打磨都须进入 UX 章节；阶段 5/6 已执行却缺少 UX 规则时，先补齐 draft。工程约束须涵盖跨页一致性、组件选择、技术栈与主题映射、预览方式和验收标准。
- 同时生成 `tokens.css` 和必要资源。

**执行方式：**

1. **读取 `DESIGN.draft.md`**，确认它包含全部获批决策：核心色板、UI 语义 tokens、字体、布局、间距和圆角；阶段 5 已执行则包含多页组件规范与状态，阶段 6 已执行则包含所选打磨项的决定，做过动效项才须包含动效系统。

2. **生成最终 `DESIGN.md`**：以 [DESIGN 模板](../../templates/DESIGN-template.md) 为骨架，填入 draft 中的实际决定；模板数值和示例不能照抄。章名、表头、字段、解释和示例提示都用用户语言，代码标识符、字体家族名和路径保留原名。按以下清单核对各章：

   1. **设计灵魂**：品牌名称、一句话风格描述、整体气质、色彩策略和字体角色。
   2. **Tokens**：颜色表写名称、`#hex` 值、token 与用途，并说明使用边界；字体写替代字体、字重、字号、行高、字距、OpenType 功能和用途，另列字号等级；间距与形状写基础单位、密度、等级、各元素圆角、阴影、页面最大宽度、章节间距和卡片内边距。
   3. **组件**：至少覆盖按钮、卡片、导航栏、页脚、输入框、标签、价格展示和空状态；逐个写用途、背景、文字、圆角、内边距、字体、平台对应状态及过渡。Web/H5 只映射本次实际使用的组件库或自定义组件及适用端，不要求两端组件逐项对应。
   4. **UX 约束（必需）**：汇总阶段 4–6 已批准的筛选/搜索/排序、导航、表单校验、错误文案、平台对应的交互反馈，以及 default/loading/empty/error。Web 核对对比度、焦点和键盘导航；移动端核对对比度、触控热区和屏幕阅读器标签。缺少此章即未完成。
   5. **该做与不该做**：写出可执行约定、适用的通用禁忌和品牌专属禁忌。
   6. **表面与层次**：按需列层级 0/1/2/3 的颜色和用途，并明确阴影策略，即使决定不用阴影也要记录。
   7. **图像与布局**：记录摄影、插画、logo 墙和禁用内容的风格，以及导航高度、Hero、列宽和纵向节奏。
   8. **响应式行为**：记录断点、移动布局和最小触控热区。
   9. **规范驱动的约束（Web/H5 必需）**：记录实际框架、构建工具、组件库、各端独立预览入口与命令、共用语义 tokens 到各端主题的映射，以及本次使用的组件和验收方式。品牌、信息层级和核心任务一致，控件、布局、导航和操作可适配设备；原型只验证 UI，不把 API 或业务状态管理列为交付要求。
   10. **代理提示指南**：提供颜色速查、可复制的组件提示、常见错误及修法。

   **章节裁剪**：设计灵魂、Tokens、组件、UX、该做与不该做、代理提示为必需。无分层策略时可将第 6 章并入布局；不用图像时可简化第 7 章；仅桌面产品可简化第 8 章；Web/H5 保留第 9 章。渐变、理念和相近品牌按需补充；阶段 6 未做动效打磨时不强加动效章节，做过则详细记录动效与过渡。

3. **生成 `tokens.css`**：提供可直接用于项目的 CSS 自定义属性。
4. **生成资源**：若有 logo、图标等，保存到 `docs/prototype/{end}/design/assets/`。
5. **更新 `AGENTS.md`**：在项目根目录按端追加设计系统引用，保留其他端已有条目。所有入口都引用 `docs/prototype/{end}/DESIGN.md`；生成了 `tokens.css` 时一并引用 `docs/prototype/{end}/design/tokens.css`。已有系统的原始设计资产保留在原位置，并在该端规范中注明来源。例如：

   ```markdown
   ## 设计系统

   本项目的设计系统由 zero-to-design 流程建立。新增页面、组件或视觉改动前，请先阅读：

   - `admin`（运营后台）：`docs/prototype/admin/DESIGN.md`——完整设计系统文档
     - `docs/prototype/admin/design/tokens.css`——可直接使用的 CSS 自定义属性

   所有视觉决策（颜色、字体、圆角、阴影、动效、交互）及 Web/H5 组件选择均以当前权威设计来源为准。
   ```

6. **清理 draft**：`DESIGN.md` 获用户批准后，按用户选择将 `DESIGN.draft.md` 重命名为 `DESIGN.draft.md.bak` 或删除，避免日后混淆。

**正常流程的产物结构（新项目 Web/H5 示例；只创建用户要求的平台）：**

```
docs/prototype/{end}/design/
├── 01-product.md
├── 02-references.md
├── 03-directions.html
├── web/                       (Web 任务才创建)
│   ├── index.html              (独立预览入口)
│   ├── main.ts
│   ├── 04-<screen>-v1.vue
│   ├── 05-<screen>-v1.vue
│   └── 06-<screen>-v1.vue
├── h5/                        (H5 任务才创建，同样有独立入口与版本源码)
├── 05-screen-map-v*.md
├── component-inventory.md
├── 05-<target>-implementation-v*.md
├── 06-polish-log.md
├── existing-system.md          (已有系统盘点时)
├── tokens.css
└── assets/
docs/prototype/{end}/DESIGN.md
```

新项目还需在原型工程提供 Vite 的依赖和运行配置；已有项目按其框架选择源码后缀与入口形式，并在状态文件记录实际路径和命令。`04-*`、`05-*`、`06-*` 的旧版本须可复查。

**批准门槛**：用户确认 `DESIGN.md` 完整、准确，并与阶段 5/6 的反馈一致。

## 完成标准

最终只将适用的设计参考规则写入 `DESIGN.md` 的“该做与不该做”。本 skill 可作为 Open Design 的上游流程：先确定方向并完成 `DESIGN.md`，再导入 Open Design 设计后续页面。

`DESIGN.md` 已生成且获用户批准时，在 `docs/prototype/{end}/design/state.md` 中标记 `status: complete`，并按实际执行的入口与阶段告知用户相应产物（跳过的阶段不列为已完成）：

1. 产品定义（`01-product.md`）
2. 参考收集（`02-references.md`）
3. 方向选择（`03-directions.html`）
4. 首屏预览（目标平台的独立预览入口和 `04-<screen>-v*` 源码；确认两页时用双屏预览）
5. 核心页面扩展（目标平台的 `05-<screen>-v*` 源码、`05-screen-map-v*.md`、`05-<target>-implementation-v*.md`、`component-inventory.md`）
6. 跨页面打磨（目标平台的 `06-<screen>-v*` 源码、`06-polish-log.md` 及可选维度评审页）
7. 扩展模式中生成的页面或组件预览（若执行）
8. 设计系统文档（`docs/prototype/{end}/DESIGN.md`、`docs/prototype/{end}/design/tokens.css`、`docs/prototype/{end}/design/assets/`）
9. 已增加设计系统引用的 `AGENTS.md`，便于今后的代理会话自动读取约束
10. `DESIGN.draft.md.bak`（若用户选择保留原 draft）

所有入口的最终 `DESIGN.md` 都位于 `docs/prototype/{end}/`；生成的 `tokens.css` 和资源位于该端的 `design/` 下。已有系统的原始设计资产保留在原位置，并由该端的 `DESIGN.md` 引用。以后开发页面都应遵循当前端最终规范中的约束；`AGENTS.md` 已按端指向相应来源。
