import type { ComponentChildren, FunctionComponent } from "preact";
import "./LinkButton.css";

interface LinkButtonProps {
	href: string;
	variant?: "primary" | "secondary";
	children: ComponentChildren;
}

export const LinkButton: FunctionComponent<LinkButtonProps> = ({
	href,
	variant = "primary",
	children,
}) => {
	const isExternal = href.startsWith("http://") || href.startsWith("https://");
	const className = `btn btn-${variant}`;

	return (
		<a
			href={href}
			className={className}
			{...(isExternal && { target: "_blank", rel: "noopener" })}
		>
			<span>{children}</span>
		</a>
	);
};
