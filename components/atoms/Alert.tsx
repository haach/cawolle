import type { ReactNode } from "react";
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

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) => {
  const classes = [styles.alert, styles[variant], className].filter(Boolean).join(" ");
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
