import "./index.css";
import { StarIcon } from "../components/icons/StarIcon.tsx";
import { LinkButton } from "../components/LinkButton.tsx";
import Counter from "../islands/counter.tsx";

export default function Home() {
	return (
		<>
			<section className="hero">
				<div className="hero-content">
					<div className="star-emblem">
						<StarIcon />
					</div>
					<h1>
						<span className="highlight">Castro</span>
						The People's Framework
					</h1>
					<p className="tagline">
						The Educational Island Architecture Framework
						<br />
						(That Happens to Be Communist)
					</p>
					<p className="subtitle">
						"The satire is optional. The knowledge is real."
					</p>
					<div className="cta-buttons">
						<LinkButton href="/manifesto" variant="primary">
							Read the Manifesto
						</LinkButton>
						<LinkButton
							href="https://github.com/vktrz/castro"
							variant="secondary"
						>
							View Source Code
						</LinkButton>
						<LinkButton href="/tutorial" variant="secondary">
							Start Tutorial
						</LinkButton>
					</div>
				</div>
			</section>

			<section className="directives">
				<div className="section-header">
					<h2>The Revolutionary Directives</h2>
					<p>
						Learn how modern SSGs work by reading ~1500 lines of well-commented
						code. Three hydration strategies. Zero configuration.
					</p>
				</div>

				<div className="directives-grid">
					<div className="directive-card static">
						<div className="directive-header">
							<div className="directive-name">no:pasaran</div>
							<div className="directive-slogan">
								"They shall not pass (to the client)"
							</div>
						</div>
						<p className="directive-description">
							Component renders at build time. No JavaScript shipped to client.
							Pure static HTML for maximum performance.
						</p>
						<div className="directive-demo">
							<Counter initial={5} no:pasaran />
						</div>
						<p className="directive-note">
							↑ Try clicking. Nothing happens. Zero JS was sent to your browser.
						</p>
					</div>

					<div className="directive-card immediate">
						<div className="directive-header">
							<div className="directive-name">lenin:awake</div>
							<div className="directive-slogan">
								"The leader is always ready"
							</div>
						</div>
						<p className="directive-description">
							Component becomes interactive immediately on page load. Full
							interactivity from the start.
						</p>
						<div className="directive-demo">
							<Counter initial={10} lenin:awake />
						</div>
						<p className="directive-note">
							↑ This counter is interactive immediately. JS loaded on page load.
						</p>
					</div>

					<div className="directive-card lazy">
						<div className="directive-header">
							<div className="directive-name">comrade:visible</div>
							<div className="directive-slogan">
								"Only work when the people are watching"
							</div>
						</div>
						<p className="directive-description">
							Component hydrates when scrolled into viewport. Lazy loading with
							IntersectionObserver. Default behavior.
						</p>
						<div className="directive-demo">
							<Counter initial={15} comrade:visible />
						</div>
						<p className="directive-note">
							↑ JS loads when scrolled into view. Open DevTools Network tab to
							verify.
						</p>
					</div>
				</div>
			</section>

			<section className="how-it-works">
				<div className="section-header">
					<h2>How The Revolution Works</h2>
					<p>
						Island architecture explained. No magic, just smart progressive
						enhancement.
					</p>
				</div>

				<div className="steps">
					<div className="step">
						<div className="step-number">1</div>
						<div className="step-content">
							<h3>Build Time</h3>
							<p>
								Castro compiles your pages and renders all islands to static
								HTML. Every component gets server-side rendered, creating
								instant visual content.
							</p>
						</div>
					</div>

					<div className="step">
						<div className="step-number">2</div>
						<div className="step-content">
							<h3>Browser Receives HTML</h3>
							<p>
								Pure HTML arrives first. Your page is visible immediately. No
								waiting for JavaScript bundles. Islands are wrapped in{" "}
								<code>&lt;castro-island&gt;</code> custom elements.
							</p>
						</div>
					</div>

					<div className="step">
						<div className="step-number">3</div>
						<div className="step-content">
							<h3>Selective Hydration</h3>
							<p>
								JavaScript loads based on your directive.{" "}
								<code>no:pasaran</code> stays static. <code>lenin:awake</code>{" "}
								hydrates immediately. <code>comrade:visible</code> waits for
								viewport intersection.
							</p>
						</div>
					</div>

					<div className="step">
						<div className="step-number">4</div>
						<div className="step-content">
							<h3>Interactive Islands</h3>
							<p>
								Components become interactive exactly when needed. Fast initial
								load, progressive enhancement, minimal JavaScript. This is
								island architecture.
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
