# Test-Driven Development

TDD 是 red -> green loop。这份 reference 帮助 `implement` 在适用的行为变更中产出值得保留的 tests：什么是好 test、tests 应该放在哪里、anti-patterns，以及 loop 的规则。每个 cycle 前和 cycle 中都要参考这些内容，而不是事后才看。

探索 codebase 时，读取 `CONTEXT.md`（如果存在），让 test names 和 interface vocabulary 与项目 domain language 对齐，并尊重你触碰区域的 ADRs。

## What a good test is

Tests 应通过 public interfaces 或稳定业务规则函数的输入输出验证 behavior，而不是 implementation details。代码可以完全改变；tests 不该随之改变。一个好 test 读起来像 specification："user can checkout with valid cart" 能清楚说明存在什么能力；因为它不关心 internal structure，所以能承受 refactors。写 test 前先说清哪种 production code 错误会让它失败。

示例见 [tests.md](tests.md)，mocking 规则见 [mocking.md](mocking.md)。

## Seams — where tests go

**Seam** 是你测试的 public boundary：可以观察 behavior、但不伸手进入内部的 interface。Tests 优先放在 seams 上；稳定的业务规则函数已可调用时，也可以直接验证其输入输出。不只为测试私有 helper 而新增 public API。

**先确定测试边界。** 写任何 test 前，根据 spec、现有可调用接口和已有 tests 确定边界，并向用户复述；只有边界不清时才提问确认。你无法测试所有东西；先确定边界，才能把测试精力放在 critical paths 和复杂 logic 上，而不是每个 edge case。

边界不清时询问："What's the public interface, and which seams should we test?"

当 interface 的形状本身就是问题所在时——module 该多深、seam 该放在哪里、interface 应该暴露什么——用 `/codebase-design` skill 获取词汇。它是 module、interface、depth、seam、adapter、leverage 和 locality 这些术语的共享来源，是供查阅的 reference，而不是要运行的 session。

## Anti-patterns

- **Implementation-coupled** — mock internal collaborators、测试 private methods，或通过 side channel 验证（例如不用 interface 而直接查询 database）。特征是 refactor 时 test 失败，但 behavior 没变。
- **Tautological** — assertion 以和代码相同的方式重新计算 expected value（`expect(add(a, b)).toBe(a + b)`、手工按同一逻辑生成 snapshot、把 constant 断言等于它自己），因此天然 pass，永远无法与代码 disagree。Expected values 必须来自独立 source of truth：known-good literal、worked example 或 spec。
- **Horizontal slicing** — 先写所有 tests，再写所有 implementation。批量 tests 验证的是 _想象中的_ behavior：你测试的是东西的 _shape_，不是 user-facing behavior；tests 会对真实变化迟钝，并在理解 implementation 前承诺 test structure。改用 **vertical slices**：一个 test -> 一个 implementation -> repeat，每个 test 都是回应上一轮学习的 **tracer bullet**。

## Rules of the loop

- **Observe RED.** 一次只写一个最小行为测试，运行聚焦测试命令，确认它稳定地因目标行为尚未实现而失败。若立即通过，或因测试代码、环境问题而失败，先检查并修正；仍无法得到可靠 RED 时停下该增量并报告原因，继续其他独立工作。
- **Observe GREEN.** 只写足够让当前测试通过的业务代码，重跑聚焦测试并确认通过，再进入下一个增量。不要预判未来 tests 或添加 speculative features。
- **Pure refactoring.** 不为行为不变的重构制造 RED；先确认当前行为测试为 GREEN，缺少测试时先补表征当前行为的测试并确认 GREEN，重构后复跑。重构不是 RED → GREEN 循环的自动阶段；实现后的重构由 review stage 处理。
