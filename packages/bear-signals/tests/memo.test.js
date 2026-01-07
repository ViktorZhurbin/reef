import { test } from 'node:test';
import assert from 'node:assert';
import { createSignal, createEffect, createMemo } from '../lib/index.js';

test('memo computes initial value', () => {
	const [count, setCount] = createSignal(5);
	const doubled = createMemo(() => count() * 2);
	assert.strictEqual(doubled(), 10);
});

test('memo caches value and does not recompute on multiple reads', () => {
	let computeCount = 0;
	const [count, setCount] = createSignal(5);
	const doubled = createMemo(() => {
		computeCount++;
		return count() * 2;
	});

	assert.strictEqual(computeCount, 1); // Computed once on creation

	doubled();
	doubled();
	doubled();
	assert.strictEqual(computeCount, 1); // Still only computed once
});

test('memo recomputes when dependency changes', () => {
	let computeCount = 0;
	const [count, setCount] = createSignal(5);
	const doubled = createMemo(() => {
		computeCount++;
		return count() * 2;
	});

	assert.strictEqual(doubled(), 10);
	assert.strictEqual(computeCount, 1);

	setCount(10);
	assert.strictEqual(doubled(), 20);
	assert.strictEqual(computeCount, 2); // Recomputed
});

test('memo can be used in effects', () => {
	const [a, setA] = createSignal(2);
	const [b, setB] = createSignal(3);
	const sum = createMemo(() => a() + b());
	let effectValue;

	createEffect(() => {
		effectValue = sum();
	});

	assert.strictEqual(effectValue, 5);

	setA(5);
	assert.strictEqual(effectValue, 8);

	setB(7);
	assert.strictEqual(effectValue, 12);
});

test('memos can be chained', () => {
	let squaredCount = 0;
	let plusTenCount = 0;

	const [base, setBase] = createSignal(2);
	const squared = createMemo(() => {
		squaredCount++;
		return base() * base();
	});
	const plusTen = createMemo(() => {
		plusTenCount++;
		return squared() + 10;
	});

	assert.strictEqual(plusTen(), 14);
	assert.strictEqual(squaredCount, 1);
	assert.strictEqual(plusTenCount, 1);

	// Reading again doesn't recompute
	assert.strictEqual(plusTen(), 14);
	assert.strictEqual(squaredCount, 1);
	assert.strictEqual(plusTenCount, 1);

	// Changing base triggers both memos
	setBase(3);
	assert.strictEqual(plusTen(), 19);
	assert.strictEqual(squaredCount, 2);
	assert.strictEqual(plusTenCount, 2);
});

test('memo only notifies subscribers if value actually changed', () => {
	const [count, setCount] = createSignal(0);
	const isEven = createMemo(() => count() % 2 === 0);
	let effectRuns = 0;

	createEffect(() => {
		isEven();
		effectRuns++;
	});

	assert.strictEqual(effectRuns, 1);

	// Change from 0 (even) to 2 (even) - value stays true
	setCount(2);
	assert.strictEqual(effectRuns, 1); // Should not re-run!

	// Change from 2 (even) to 3 (odd) - value changes to false
	setCount(3);
	assert.strictEqual(effectRuns, 2); // Should re-run
});
