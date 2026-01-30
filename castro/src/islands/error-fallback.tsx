/**
 * Internal Error Boundary UI
 *
 * This component is compiled at runtime by Castro to display
 * islands rendering errors without crashing the build.
 */

export default function ErrorFallback(props: {
	componentName: string;
	error: Error;
}) {
	const { componentName, error } = props;

	return (
		<div
			style={{
				border: "2px dashed #c41e3a",
				padding: "1rem",
				color: "#c41e3a",
				background: "#fff0f0",
				fontFamily: "monospace",
				fontSize: "0.9em",
			}}
		>
			<strong>⚠️ Counter-revolutionary logic detected</strong>
			<div style={{ marginTop: "0.5rem", opacity: 0.8 }}>
				Error in &lt;{componentName} /&gt;
			</div>
			<pre
				style={{
					marginTop: "0.5rem",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
					maxHeight: "150px",
					overflowY: "auto",
				}}
			>
				{error.message}
			</pre>
		</div>
	);
}
