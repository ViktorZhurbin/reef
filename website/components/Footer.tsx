import type { FunctionComponent } from "preact";
import "./Footer.css";

/**
 * Castro website footer with slogan and links.
 */
export const Footer: FunctionComponent = () => {
	return (
		<footer>
			<div className="footer-slogan">
				Workers of the Web, Unite!
				<br />
				Seize the Means of Rendering.
			</div>
			<div className="footer-links">
				<a href="/about">About</a>
				<a
					href="https://github.com/vktrz/castro"
					target="_blank"
					rel="noopener"
				>
					GitHub
				</a>
			</div>
			<p style={{ marginTop: "2rem", opacity: "0.7", fontSize: "0.9rem" }}>
				Built with Castro | The People's Framework
			</p>
		</footer>
	);
};
