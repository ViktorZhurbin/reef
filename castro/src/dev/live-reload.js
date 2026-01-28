/**
 * Live Reload Client
 *
 * This runs in the BROWSER during development.
 *
 * How it works:
 * 1. Opens EventSource connection to /events endpoint
 * 2. Server keeps connection alive and watches file system
 * 3. When files change, server sends "reload" message through connection
 * 4. Browser receives message and triggers full page reload
 *
 * Uses Server-Sent Events (SSE) which is simpler than WebSockets for
 * one-way server→client messaging.
 */

// Connect to SSE endpoint
const events = new EventSource("/events");

/** @type EventSource["onmessage"] */
events.onmessage = (event) => {
	if (event.data === "reload") {
		window.location.reload();
	}
};

/** @type EventSource["onerror"] */
events.onerror = () => {
	// Server disconnected - try to reconnect
	console.log("[castro] Lost connection, attempting to reconnect...");
};
