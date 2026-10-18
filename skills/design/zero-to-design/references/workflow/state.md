# 状态管理

在项目根目录维护 `docs/prototype/{end}/design/state.md`，记录：

```markdown
# zero-to-design 状态

status: in-progress

## 设计端
- 目录名：<实际端名>
- 中文别名：<中文别名或“无”>

## 当前阶段
<当前阶段>

## 关键页面（阶段 1 锁定，1–2 页）
- <页面 A>
- <页面 B>（仅在确认两个紧密关联的页面时）

## 平台（阶段 1 锁定）
<Web / H5 / Web + H5 / iOS / Android / Desktop> · 设备形态：<phone / tablet / desktop；H5、iOS、Android 必填>

## 原型技术与预览（Web/H5 适用）
- 框架与构建工具：<实际选择；新项目默认 Vue 3 + TypeScript + Vite>
- Web 组件库：<实际选择；新项目默认 Ant Design Vue；未设计 Web 则不适用>
- H5 组件库：<实际选择；新项目默认 Vant 4；未设计 H5 则不适用>
- Web 入口与运行命令：<实际路径和命令；未设计 Web 则不适用>
- H5 入口与运行命令：<实际路径和命令；未设计 H5 则不适用>

## 入口模式
<new-product / existing-system / extension>

## 阶段 5 模式
<core-set / extension / not-applicable>

## 阶段 6 模式
<screen / core-set / extension / not-applicable>

## 当前打磨项
<当前维度 / 待开始>

## 候选决策
- <目标>：<已选候选或待决>
- 已拒绝候选：<候选 → 原因>
- 阶段 3 只生成三个方向时：<省略的角色及原因；否则写“不适用”>

## 设计系统来源
- 权威来源：<当前实际文件路径；完成时为 docs/prototype/{end}/DESIGN.md>
- 原始来源：<已有系统的原始设计资产路径，或“不适用”>
- 来源状态：<validated / partially validated / generated from exploration>
- 已有系统盘点：<not applicable / pending / complete>

## 已锁定决策
- 方向：<已选方向名称>
- 主色：<hex>
- 字体：<标题/正文>
- <其他已锁定项>

## 设计约束
- 来源：zero-to-design 内部能力
- 已使用：<shape、bolder、critique 等实际读取的文件>
- 用户明确指定的额外 skill：<名称或“无”>
- 备注：<用户特殊要求，如“更大胆”>

## 已拒绝方向
- <方向名称>：<用户原话说明的原因>

## 待决问题
- <问题清单>

## 工艺检查记录（Web/H5 适用）
- <阶段 4 页面与预览路径>：发现 <关键问题或“无”>；修正 <结果或“无”>；暂留 <问题、原因或“无”>。

## 文件清单
- [ ] existing-system.md
- [ ] 01-product.md
- [ ] 02-references.md
- [ ] 03-directions.html
- [ ] <platform>/index.html（按实际平台与入口路径填写）
- [ ] <platform>/04-<screen>-v1.<后缀>（按实际平台与源码后缀填写）
- [ ] DESIGN.draft.md
- [ ] <platform>/05-<screen>-v*.<后缀>（按实际平台与源码后缀填写）
- [ ] 05-screen-map-v*.md
- [ ] component-inventory.md
- [ ] 05-<target>-implementation-v*.md
- [ ] 06-polish-log.md
- [ ] <platform>/06-<screen>-v*.<后缀>（按实际平台与源码后缀填写）
- [ ] docs/prototype/{end}/DESIGN.md
```

文件清单只保留当前入口和目标平台适用的条目；文件实际存在后再勾选，勾选前把占位路径替换为真实路径。每个阶段完成后、当前打磨维度变化后，以及阶段 5/6 每次候选选择后，都要更新 `docs/prototype/{end}/design/state.md`。
每次阶段交接及标记 `status: complete` 前，针对已确定的项目或重启工作区运行 `node <skill>/scripts/doctor.mjs --target <项目或工作区目录> --folder <端目录名>`；核对发现项后修正状态或产物，不让脚本自动修改用户已批准的设计文件。Node.js 不可用时，按同一清单人工核对并记录未执行脚本检查。
