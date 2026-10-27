# TypeScript / Jest Test Template

BAD 与 GOOD 是替代示例；只保留符合行为要求的测试。

## Behavior test

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

## Implementation-detail test

```typescript
// BAD: Tests an internal collaborator
test("checkout calls paymentService.process", async () => {
  const process = jest.spyOn(paymentService, "process");
  await checkout(cart, paymentMethod);
  expect(process).toHaveBeenCalledWith(cart.total);
});
```

## Verify through the interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

## Independent expected value

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```

聚焦运行示例：`npx jest -t 'calculateTotal sums line items'`。
