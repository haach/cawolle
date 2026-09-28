import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "solid" | "pill";

type ButtonProps = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">;

export const Button: React.FC<ButtonProps> = ({
  variant = "solid",
  href,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) => {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if (href) {
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
