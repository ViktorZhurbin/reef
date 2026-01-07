import { test } from 'node:test';
import assert from 'node:assert';
import { createSignal } from '../lib/index.js';

test('signal stores and returns value', () => {
	const [count, setCount] = createSignal(0);
	assert.strictEqual(count(), 0);
});

test('signal updates value', () => {
	const [count, setCount] = createSignal(0);
	setCount(5);
	assert.strictEqual(count(), 5);
	setCount(10);
	assert.strictEqual(count(), 10);
});

test('signal works with different types', () => {
	const [str, setStr] = createSignal('hello');
	assert.strictEqual(str(), 'hello');

	const [obj, setObj] = createSignal({ name: 'Alice' });
	assert.deepStrictEqual(obj(), { name: 'Alice' });

	const [arr, setArr] = createSignal([1, 2, 3]);
	assert.deepStrictEqual(arr(), [1, 2, 3]);
});
