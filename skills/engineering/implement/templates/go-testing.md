# Go / testing Test Template

BAD 与 GOOD 是替代示例。以下省略项目已有的 package 和 import；`CalculateTotal` 与数据类型按现有 API 调整。

```go
// BAD: Recomputes the expected value with the same summing rule
func TestCalculateTotalRecomputesExpected(t *testing.T) {
    prices := []int{10, 5}
    want := 0
    for _, price := range prices {
        want += price
    }
    if got := CalculateTotal(prices); got != want {
        t.Errorf("CalculateTotal() = %d, want %d", got, want)
    }
}

// GOOD: Uses an independent, known value
func TestCalculateTotal(t *testing.T) {
    if got := CalculateTotal([]int{10, 5}); got != 15 {
        t.Errorf("CalculateTotal() = %d, want 15", got)
    }
}
```

聚焦运行示例：`go test ./path/to/package -run '^TestCalculateTotal$'`。
