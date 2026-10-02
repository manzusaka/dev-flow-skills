> 改编自 Impeccable `audit.native.md`（Apache-2.0）；已翻译并接入 zero-to-design。许可见 `../../licenses/IMPECCABLE-APACHE-2.0.txt`。

# 原生 Audit：检查平台实现

本文件用于 iOS、Android 或两者兼容的原生应用；不对原生代码运行 Web 静态扫描。先读 [iOS](ios.md) 和/或 [Android](android.md)，再基于源码、Simulator/Emulator 与可用实机证据报告问题。只审查，不在报告过程中修改实现。

## 五个维度（各 0–4 分）

1. **无障碍**：VoiceOver/TalkBack 标签与顺序、状态宣告、Dynamic Type/sp、触控热区、对比度、Reduce Motion。
2. **性能**：启动、长列表虚拟化、主线程卡顿、重复渲染、图片解码和包体。
3. **外观与主题**：语义颜色、暗色模式、动态色与系统材质；避免未经说明的硬编码。
4. **平台一致性**：系统返回手势、safe area/insets、导航、控件和图标是否符合对应平台。
5. **适配性**：手机/平板、横竖屏、键盘、分屏与折叠状态。

评分：0 无法使用，1 严重缺陷，2 部分可用，3 少量问题，4 稳定且符合平台。总分满分 20。先给平台一致性结论，再列五维评分、有效做法和 P0–P3 问题；每项说明位置、用户影响、证据及具体修法。不能把浏览器画框当成原生运行验证。将选中的打磨项和未验证行为写入 `06-polish-log.md`，按需要使用本地 `adapt`、`harden`、`animate` 或 `clarify` 能力处理。
