# Bare Signals

Primitive implementation of reactive signals inspired by [Solid.js](https://github.com/solidjs/solid/blob/main/packages/solid/src/reactive/signal.ts).

Built as a learning project to understand how fine-grained reactivity works under the hood.

## Core Concepts

**Signals** - Reactive values with automatic dependency tracking
**Effects** - Functions that auto-run when their signal dependencies change
**Memos** - Cached computed values that only recompute when dependencies change

## Usage

```js
import { createSignal, createEffect, createMemo } from '@vktrz/bare-signals';

const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);

createEffect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

setCount(5); // Logs: "Count: 5, Doubled: 10"
```
