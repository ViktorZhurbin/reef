/**
 * BARE SIGNALS - Educational Reactive System
 *
 * How it works:
 *
 * 1. GLOBAL CONTEXT TRACKING
 *    - `listener` variable tracks which effect/memo is currently executing
 *    - When a signal is read during execution, it subscribes the current listener
 *    - This enables automatic, implicit dependency tracking
 *
 * 2. BIDIRECTIONAL CONNECTIONS
 *    - Signals → Subscribers (forward): "When I change, notify these effects"
 *    - Effects → Dependencies (backward): "I need to unsubscribe from these signals"
 *
 * 3. DYNAMIC DEPENDENCIES
 *    - Before re-running, effects cleanup old subscriptions
 *    - During re-run, new subscriptions are formed based on which signals are actually read
 *    - This handles conditional logic (if/else) where dependencies change at runtime
 *
 * 4. MEMOS AS HYBRIDS
 *    - Act as effects: track dependencies, re-run when they change
 *    - Act as signals: can be read, notify their own subscribers
 *    - Cache computed values, only recompute when dependencies change
 *
 * Core pattern: cleanup → track → execute → subscribe
 */

// Global context - tracks which effect is currently executing
let listener = null;

/**
 * SIGNAL
 * Creates a reactive signal
 * Returns [getter, setter] tuple like React's useState
 *
 * @param {*} initialValue - The initial value
 * @returns {[Function, Function]} [read, write] functions
 */
export function createSignal(initialValue) {
	let value = initialValue;
	const subscribers = new Set();

	// Getter function
	function read() {
		subscribe(subscribers, read);
		return value;
	}

	// Setter function
	function write(newValue) {
		value = newValue;
		notifySubscribers(subscribers);
	}

	// Expose subscribers for cleanup (effects need to unsubscribe)
	read.subscribers = subscribers;

	return [read, write];
}

/**
 * EFFECT
 * Creates a reactive effect that automatically re-runs when its dependencies change
 *
 * @param {Function} fn - The effect function to run
 */
export function createEffect(fn) {
	const effect = {
		dependencies: new Set(),
		execute() {
			track(effect, fn);
		},
	};

	// Run immediately on creation
	effect.execute();
}

/**
 * MEMO
 * Creates a memoized computed value
 * Only re-computes when dependencies change
 *
 * @param {Function} fn - The computation function
 * @returns {Function} A getter function for the computed value
 */
export function createMemo(fn) {
	let value;
	const subscribers = new Set();

	// The memo acts as an effect (has dependencies, re-runs)
	const memo = {
		dependencies: new Set(),
		execute() {
			const newValue = track(memo, fn);

			// If value changed, notify subscribers
			if (newValue !== value) {
				value = newValue;
				notifySubscribers(subscribers);
			}
		},
	};

	// Compute initial value
	memo.execute();

	// The memo also acts as a signal (can be read)
	function read() {
		subscribe(subscribers, read);
		return value;
	}

	// Expose subscribers for cleanup
	read.subscribers = subscribers;

	return read;
}

/**
 * Unsubscribes effect from all its dependencies
 * @param {Object} effect - The effect to clean up
 */
function cleanup(effect) {
	for (const signal of effect.dependencies) {
		signal.subscribers.delete(effect);
	}
	effect.dependencies.clear();
}

/**
 * Notifies all subscribers of a change
 * @param {Set} subscribers - The set of subscribers to notify
 */
function notifySubscribers(subscribers) {
	const subscribersSnapshot = [...subscribers];
	for (const sub of subscribersSnapshot) {
		sub.execute();
	}
}

/**
 * Subscribes current listener to a signal
 * @param {Set} subscribers - The signal's subscriber set
 * @param {Function} signal - The signal function being read
 */
function subscribe(subscribers, signal) {
	if (listener) {
		subscribers.add(listener);
		listener.dependencies.add(signal);
	}
}

/**
 * Executes a function with tracking (sets listener context)
 * @param {Object} effect - The effect/memo to set as listener
 * @param {Function} fn - The function to execute
 * @returns {*} The return value of fn
 */
function track(effect, fn) {
	cleanup(effect);
	listener = effect;
	const result = fn();
	listener = null;
	return result;
}
