import Link from "next/link";
import type { ComponentProps, FC, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";
import styles from "./Button.module.css";

type Variant = "solid" | "pill";

type ButtonProps = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">;

export const Button: FC<ButtonProps> = ({
  variant = "pill",
  href,
  className,
  children,
  type = "button",
  ...props
}) => {
  const classes = cn(styles.button, styles[variant], className);

  if (href) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <ExternalLink href={href} className={classes}>
          {children}
        </ExternalLink>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};
