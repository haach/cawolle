import type { ReactNode } from "react";
import { Typography } from "@/components/atoms";
import styles from "./Section.module.css";

type Tone = "plain" | "beige";
type Align = "center" | "start";

type SectionProps = {
  id?: string;
  title: string;
  heading?: "h1" | "h2";
  tone?: Tone;
  align?: Align;
  wide?: boolean;
  children: ReactNode;
};

export function Section({
  id,
  title,
  heading = "h2",
  tone = "plain",
  align = "start",
  wide = false,
  children,
}: SectionProps) {
  const className = [styles.section, styles[tone], styles[align], wide ? styles.wide : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={className} data-tone={tone}>
      <div className={styles.inner}>
        <Typography variant={heading}>{title}</Typography>
        <hr className={styles.rule} />
        {children}
      </div>
    </section>
  );
}
