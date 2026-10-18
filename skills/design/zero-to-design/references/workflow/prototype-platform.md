# 原型平台约束

**Web/H5 原型技术约束**：阶段 3 的 `03-directions.html` 只比较视觉方向。阶段 4 起使用目标项目的框架、组件库和样式生成可运行的 UI 原型；已有项目沿用现有技术栈与构建工具。新项目默认 Vue 3 + TypeScript + Vite，Web 使用 Ant Design Vue（`ant-design-vue`），H5 使用 Vant 4（`vant`）；用户明确指定的项目技术栈优先。只产出用户要求的平台；同时设计 Web 和 H5 时，在 `docs/prototype/{end}/design/web/` 与 `docs/prototype/{end}/design/h5/` 分别设置预览入口，共用语义 tokens，但各自采用适合设备的组件、布局和交互。预览入口无需接入目标应用路由。原型使用示例数据和必要的本地交互状态，不接入真实 API 或业务状态管理。必要时可制作原型专用 UI 组件，并记录使用边界。原生平台不适用上述 Web/H5 默认技术栈。

Web 源码的机械线索可用 `node <skill>/scripts/scan.mjs --target <文件或目录> [--scope type|layout|audit]` 检查，支持 `--json`；工具不能替代运行界面观察。
