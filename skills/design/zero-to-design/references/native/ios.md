> 改编自 Impeccable `ios.md`（Apache-2.0）；已翻译并接入 zero-to-design。许可见 `../../licenses/IMPECCABLE-APACHE-2.0.txt`。

# iOS / iPadOS 平台

适用于交付到 Apple 设备的 SwiftUI、UIKit、React Native、Expo 或 Flutter 应用。平台导航、控件和手势先遵循系统惯例；品牌通过 tint、字体重点、内容与动效表达。

- **结构**：尊重 safe area、Dynamic Island、Home indicator 和键盘区域。顶层目的地使用系统 tab bar，层级使用导航栈，独立任务使用 sheet；返回边缘手势应正常工作。顶层可用 large title，详情页按内容选择 inline title。
- **触控**：可点击区域至少 44×44 pt，相邻目标留足间隔。
- **字体**：使用 Dynamic Type 的系统文字角色，让用户字号设置生效；正文、标签与控件保持可读，品牌字体用于有意义的展示时刻。
- **颜色**：用语义系统色与 tint 适配浅色、Dark Mode 和增强对比度；系统栏和 sheet 使用相应材质，不仿造 Web 玻璃效果。
- **控件**：优先使用系统 switch、segmented control、picker、alert、context menu 和 swipe action；图标使用与系统文字对齐的 SF Symbols。模态操作有清楚的取消与完成路径。
- **Motion**：沿用系统导航转场；Reduce Motion 下以较温和的变化保留状态反馈。

有可运行应用时，在 Simulator 上检查实际目标设备并截图：`xcrun simctl io booted screenshot <path>`。同时检查 Dark Mode、较大 Dynamic Type 与关键手势。模拟器之外的设备姿态、触感或性能没有实机证据时应标明未验证。
