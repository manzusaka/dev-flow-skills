# `to-tickets` 使用 OpenSpec planning artifacts

`to-tickets` 原地从 issue-tracker ticket publisher 改为读取 `/to-spec` 产生的 OpenSpec proposal，并生成 delta specs、`design.md` 与 tracer-bullet `tasks.md`。相比继续维护 tracker/local-file 双介质或新增并行 skill，这个选择让 schema 和 templates 成为单一契约，并保留用户已经记住的入口名称；代价是 `to-tickets` 不再产生名为 ticket 的 tracker artifacts，执行顺序改由标准 `tasks.md` group 顺序表达。
