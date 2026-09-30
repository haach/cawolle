import type { FC, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Alert.module.css";
import { Typography } from "./Typography";
import { Spacing } from "./Spacing";

type Variant = "error" | "warning" | "success" | "info";

type AlertProps = {
  variant?: Variant;
  title: string;
  children: ReactNode;
  className?: string;
};

const politeVariants = new Set<Variant>(["success", "info"]);

export const Alert: FC<AlertProps> = ({ variant = "info", title, children, className }) => {
  const classes = cn(styles.alert, styles[variant], className);
  const polite = politeVariants.has(variant);

  if (polite) {
    return (
      <output className={classes}>
        <Spacing space={5}>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body">{children}</Typography>
        </Spacing>
      </output>
    );
  }

  return (
    <div className={classes} role="alert">
      <Spacing space={5}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body">{children}</Typography>
      </Spacing>
    </div>
  );
};
