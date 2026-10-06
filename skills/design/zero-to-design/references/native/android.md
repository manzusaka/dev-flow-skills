> 改编自 Impeccable `android.md`（Apache-2.0）；已翻译并接入 zero-to-design。许可见 `../../licenses/IMPECCABLE-APACHE-2.0.txt`。

# Android 平台

适用于 Jetpack Compose、Android Views、React Native、Expo 或 Flutter 的 Android 应用。结构、导航和控件遵循 Material 3，品牌表达通过其色彩角色、字体、形状与 Motion 体系进入。

## Android 主张

- 依据当前窗口空间调整信息结构，不把物理设备类型或固定竖屏当作布局前提。
- 可在不同导航和内容布局间切换，但须保留当前对象、选择状态和导航上下文。
- 核心操作要能被发现，并有手势之外的可用路径，供辅助技术及其他输入方式完成。

## 平台规则

- **结构**：紧凑宽度使用 navigation bar，宽屏改用 rail 或 drawer；系统 Back 与 predictive Back 保持可用。处理状态栏、导航栏、cutout 和 IME insets，避免控件被遮住。
- **触控**：目标至少 48×48 dp，并留足相邻间隔。
- **字体**：使用 Material 的 Display、Headline、Title、Body、Label 角色；尺寸采用可随系统字号变化的 sp，不按每页任意挑 px。
- **颜色**：使用 primary、surface、outline、error 等语义角色；浅色与暗色主题分别检查。适用时可使用 Dynamic Color，并提供静态回退方案。
- **控件**：使用 Material button、switch、chip、snackbar、bottom sheet、dialog 和对应导航组件。FAB 只承担一个明确的主要动作。
- **Motion**：使用符合平台的状态与空间过渡，尊重系统减少动画设置。

有可运行应用时，在 Emulator 或连接设备上检查目标设备并截图：`adb exec-out screencap -p > <path>`。检查暗色主题、放大字体、系统 Back、键盘遮挡；模拟器无法证明真实设备的手势和性能，需标明证据来源。
