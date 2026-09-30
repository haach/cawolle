import type { ComponentProps, FC, ReactNode } from "react";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children" | "target" | "rel">;

export const ExternalLink: FC<ExternalLinkProps> = ({ href, children, ...props }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);
