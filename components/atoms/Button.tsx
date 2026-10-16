import Link from "next/link";
import type { ComponentProps, FC, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";
import styles from "./Button.module.css";

type Variant = "solid" | "pill";

type SharedProps = {
  variant?: Variant;
  href?: string;
} & Omit<ComponentProps<"button">, "children" | "aria-label">;

type ButtonProps = SharedProps &
  (
    | { icon: ReactNode; children?: never; "aria-label": string }
    | { icon?: undefined; children: ReactNode; "aria-label"?: string }
  );

export const Button: FC<ButtonProps> = ({
  variant = "pill",
  href,
  className,
  icon,
  children,
  type = "button",
  ...props
}) => {
  const classes = cn(styles.button, styles[variant], icon ? styles.icon : false, className);
  const content = icon ?? children;

  if (href) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <ExternalLink href={href} className={classes}>
          {content}
        </ExternalLink>
      );
    }

    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
};
