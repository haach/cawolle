import Link from "next/link";
import type { FC } from "react";
import { Typography } from "@/components/atoms";
import { footerNav, siteConfig } from "@/services/site";
import styles from "./Footer.module.css";

export const Footer: FC = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <Typography color="muted">{siteConfig.name}</Typography>
      <nav aria-label="Rechtliches">
        <ul className={styles.nav}>
          {footerNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </footer>
);
