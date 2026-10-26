import type { ElementType, FC, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Typography.module.css";

const variantElement = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  small: "p",
} as const;

type Variant = keyof typeof variantElement;
type Color = "default" | "brand" | "muted" | "inverse";
type Weight = "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold";

const defaultColor: Record<Variant, Color> = {
  h1: "brand",
  h2: "brand",
  h3: "brand",
  h4: "brand",
  h5: "brand",
  h6: "brand",
  body: "default",
  small: "default",
};

type TypographyProps = {
  variant?: Variant;
  as?: ElementType;
  color?: Color;
  weight?: Weight;
  italic?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
};

export const Typography: FC<TypographyProps> = ({
  variant = "body",
  as,
  color,
  weight,
  italic = false,
  children,
  className,
  id,
  role,
}) => {
  const Component = as ?? variantElement[variant];
  const classes = cn(
    styles.root,
    styles[variant],
    styles[`color-${color ?? defaultColor[variant]}`],
    weight && styles[`weight-${weight}`],
    italic && styles.italic,
    className,
  );

  return (
    <Component className={classes} id={id} role={role}>
      {children}
    </Component>
  );
};
