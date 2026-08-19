---
name: implement
description: "基于 spec、OpenSpec tasks 或 tracker ticket 实现一段工作。"
disable-model-invocation: true
---

实现用户在 spec、OpenSpec `tasks.md` 或 tracker ticket 中指定的一段工作。OpenSpec 输入一次只处理一个已选 vertical-slice group；开始前复述范围并确认对应 checkbox。

尽可能在预先约定好的 seams 上使用 `/tdd`。

定期运行 typechecking，定期运行单个测试文件，并在最后运行完整测试套件。

完成后，使用 `/code-review` 审查这次工作。

来源是 OpenSpec `tasks.md` 时，只在实现、测试和 review 全部通过后勾选本次完成的 checkboxes；不勾选未实际完成的相邻任务。

把工作提交到当前 branch。
