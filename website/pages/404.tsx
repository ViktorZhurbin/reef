import "./404.css";
import { StarIcon } from "../components/icons/StarIcon.tsx";
import { LinkButton } from "../components/LinkButton.tsx";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<section className="not-found-hero">
			<div className="not-found-content">
				<div className="star-emblem redacted">
					<StarIcon />
				</div>
				<h1>
					<span className="error-code">404</span>
					Page Not Found
				</h1>
				<p className="redacted-message">
					This page has been redacted by the Ministry of Truth.
					<br />
					It never existed.
				</p>
				<p className="subtitle">
					Perhaps it was a counter-revolutionary element that needed correction.
				</p>
				<div className="cta-buttons">
					<LinkButton href="/" variant="primary">
						Return to the Collective
					</LinkButton>
				</div>
			</div>
		</section>
	);
}
