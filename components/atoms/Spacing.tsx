import type { CSSProperties, ReactNode } from "react";
import styles from "./Spacing.module.css";

type Space = 5 | 10 | 15 | 16 | 20 | 30 | 40 | 50 | 55 | 60 | 70 | 75 | 80;

type SpacingProps = {
  space?: Space;
  dir?: "col" | "row";
  children: ReactNode;
  className?: string;
};

export const Spacing: React.FC<SpacingProps> = ({
  space = 30,
  dir = "col",
  children,
  className,
}: SpacingProps) => {
  return (
    <div
      className={[styles.spacing, styles[dir], className].filter(Boolean).join(" ")}
      style={{ "--spacing": `var(--space-${space})` } as CSSProperties}
    >
      {children}
    </div>
  );
};
