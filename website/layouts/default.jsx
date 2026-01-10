export default function DefaultLayout({
	title,
	content,
	scripts = [],
	importMaps = [],
}) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="stylesheet" href="/styles.css" />
				{/* Import maps must come before module scripts */}
				{importMaps.map((html, i) => (
					<div
						key={`importmap-${i}`}
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				))}
				{/* Plugin scripts and live reload */}
				{scripts.map((html, i) => (
					<div key={`script-${i}`} dangerouslySetInnerHTML={{ __html: html }} />
				))}
			</head>
			<body>
				<header>
					<h1>
						<nav>
							<a href="/index.html">bare-static</a>
							<a href="/blog/index.html">blog</a>
						</nav>
					</h1>
					<nav>
						<a href="/index.html">Home</a>
						<a href="/islands-preact.html">Preact Plugin</a>
						<a href="/islands-solid.html">Solid Plugin</a>
					</nav>
				</header>
				<main dangerouslySetInnerHTML={{ __html: content }} />
			</body>
		</html>
	);
}
