# Good and Bad Tests

只读取项目所用语言和框架的测试模板：

- [TypeScript / Jest](../templates/typescript-jest.md)
- [Java / JUnit](../templates/java-junit.md)
- [Go / testing](../templates/go-testing.md)
- [Python / unittest](../templates/python-unittest.md)

模板只示意测试写法；业务 API、数据类型、import、框架版本和运行命令以项目为准。

## Good Tests

**Behavior tests**：通过真实 interfaces 或稳定业务规则函数测试，而不是 mock internal parts。

Characteristics：

- 测试 users/callers 关心的 behavior
- 使用 public API 或稳定业务规则函数的可调用接口
- 能承受 internal refactors
- 描述 WHAT，而不是 HOW
- 每个 test 一个 logical assertion

## Bad Tests

**Implementation-detail tests**：与 internal structure 耦合。

Red flags：

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Refactor 但 behavior 未变时 test breaks
- Test name 描述 HOW 而不是 WHAT
- 绕过 interface 用外部方式验证，例如跳过查询接口而直接查数据库

**Tautological tests**：expected value 复述了 implementation，因此 test 天然通过。Expected value 应来自独立的 known literal、worked example 或 spec，不应以同一算法重新计算。
