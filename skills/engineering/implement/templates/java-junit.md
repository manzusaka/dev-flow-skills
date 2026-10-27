# Java / JUnit Test Template

## Business rule

BAD 与 GOOD 是替代示例。以下省略项目已有的 import 和测试类；`calculateTotal` 与数据类型按现有 API 调整。

```java
// BAD: Recomputes the expected value with the same summing rule
@Test
void recomputesExpectedValue() {
    List<Integer> prices = List.of(10, 5);
    int expected = prices.stream().mapToInt(Integer::intValue).sum();
    assertEquals(expected, calculateTotal(prices));
}

// GOOD: Uses an independent, known value
@Test
void sumsLineItems() {
    assertEquals(15, calculateTotal(List.of(10, 5)));
}
```

## Spring（service / bean）

当要验证 Spring 管理的 bean 及其注入后的行为时，用 `@SpringJUnitConfig` 只加载测试所需的配置。它会创建 Spring 测试上下文；若只验证不依赖容器的业务规则，直接用上面的 JUnit 测试。

```java
@SpringJUnitConfig(TotalService.class)
class TotalServiceSpringTest {
    @Autowired
    private TotalService service;

    @Test
    void sumsLineItems() {
        assertEquals(15, service.calculateTotal(List.of(10, 5)));
    }
}
```

## Spring MVC（controller）

验证 HTTP 路由、请求绑定、状态码或响应体时，使用 `@WebMvcTest` 的 MVC 测试切片和 `MockMvc`。它会加载 MVC 测试上下文，属于切片测试；纯业务规则仍用上面的 JUnit 单元测试。下面假设 `TotalController` 通过可独立运行的 `TotalService` 处理请求；按项目实际依赖装配，并使用项目版本对应的 imports。

```java
@WebMvcTest(TotalController.class)
@Import(TotalService.class)
class TotalControllerTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void returnsTotalForLineItems() throws Exception {
        mvc.perform(post("/totals")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"prices\":[10,5]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(15));
    }
}
```

断言客户端可见的响应，不以 `verify(service)` 的调用次数或顺序代替行为断言。若需要完全不加载 Spring 上下文的 controller 单元测试，用 `MockMvcBuilders.standaloneSetup(controller)` 并显式装配该测试所需的 MVC 配置。

聚焦运行示例（先使用项目已有 wrapper 和构建配置）：

- Maven：`./mvnw -Dtest=CalculateTotalTest test`
- Gradle：`./gradlew test --tests '*CalculateTotalTest'`

Spring service 示例将类名换成 `TotalServiceSpringTest`；Spring MVC 示例换成 `TotalControllerTest`，仍使用相同的聚焦方式。
