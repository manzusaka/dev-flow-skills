# Python / unittest Test Template

BAD 与 GOOD 是替代示例。以下省略项目已有的 import；`calculate_total` 与数据类型按现有 API 调整。

```python
class CalculateTotalTests(unittest.TestCase):
    # BAD: Recomputes the expected value with the same summing rule
    def test_recomputes_expected_value(self):
        prices = [10, 5]
        self.assertEqual(calculate_total(prices), sum(prices))

    # GOOD: Uses an independent, known value
    def test_sums_line_items(self):
        self.assertEqual(calculate_total([10, 5]), 15)
```

聚焦运行示例：`python -m unittest tests.test_totals.CalculateTotalTests.test_sums_line_items`。
