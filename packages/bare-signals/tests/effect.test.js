import { test } from 'node:test';
import assert from 'node:assert';
import { createSignal, createEffect } from '../lib/index.js';

test('effect runs immediately on creation', () => {
	let runCount = 0;
	createEffect(() => {
		runCount++;
	});
	assert.strictEqual(runCount, 1);
});

test('effect re-runs when signal changes', () => {
	const [count, setCount] = createSignal(0);
	let runCount = 0;
	let lastValue;

	createEffect(() => {
		runCount++;
		lastValue = count();
	});

	assert.strictEqual(runCount, 1);
	assert.strictEqual(lastValue, 0);

	setCount(5);
	assert.strictEqual(runCount, 2);
	assert.strictEqual(lastValue, 5);

	setCount(10);
	assert.strictEqual(runCount, 3);
	assert.strictEqual(lastValue, 10);
});

test('effect tracks multiple signals', () => {
	const [firstName, setFirstName] = createSignal('Alice');
	const [lastName, setLastName] = createSignal('Smith');
	let fullName = '';

	createEffect(() => {
		fullName = `${firstName()} ${lastName()}`;
	});

	assert.strictEqual(fullName, 'Alice Smith');

	setFirstName('Bob');
	assert.strictEqual(fullName, 'Bob Smith');

	setLastName('Jones');
	assert.strictEqual(fullName, 'Bob Jones');
});

test('effect only tracks signals actually read (conditional dependencies)', () => {
	const [showDetails, setShowDetails] = createSignal(true);
	const [userName, setUserName] = createSignal('Alice');
	const [guestCount, setGuestCount] = createSignal(0);
	let runCount = 0;
	let lastOutput = '';

	createEffect(() => {
		runCount++;
		if (showDetails()) {
			lastOutput = `User: ${userName()}`;
		} else {
			lastOutput = `Guest #${guestCount()}`;
		}
	});

	assert.strictEqual(runCount, 1);
	assert.strictEqual(lastOutput, 'User: Alice');

	// Switch to guest mode
	setShowDetails(false);
	assert.strictEqual(runCount, 2);
	assert.strictEqual(lastOutput, 'Guest #0');

	// Updating userName should NOT trigger effect (it's not being read anymore)
	setUserName('Bob');
	assert.strictEqual(runCount, 2); // Still 2, not 3!
	assert.strictEqual(lastOutput, 'Guest #0');

	// Updating guestCount SHOULD trigger effect
	setGuestCount(5);
	assert.strictEqual(runCount, 3);
	assert.strictEqual(lastOutput, 'Guest #5');
});
