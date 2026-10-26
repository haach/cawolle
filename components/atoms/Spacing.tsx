import type { CSSProperties, FC, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Spacing.module.css";

type Space = 0 | 2 | 5 | 10 | 15 | 16 | 20 | 30 | 40 | 50 | 55 | 60 | 70 | 75 | 80;

type SpacingProps = {
  space?: Space;
  dir?: "col" | "row";
  children: ReactNode;
  className?: string;
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end";
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-atomic"?: boolean;
};

export const Spacing: FC<SpacingProps> = ({
  space = 30,
  dir = "col",
  children,
  className,
  alignItems = "start",
  justifyContent = "start",
  "aria-live": ariaLive,
  "aria-atomic": ariaAtomic,
}) => {
  return (
    <div
      className={cn(styles.spacing, styles[dir], className)}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      style={
        {
          "--spacing": `var(--space-${space})`,
          alignItems: alignItems,
          justifyContent: justifyContent,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};
