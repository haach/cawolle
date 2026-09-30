import Link from "next/link";
import type { FC } from "react";
import { footerNav, siteConfig } from "@/services/site";
import styles from "./Footer.module.css";

export const Footer: FC = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <p className={styles.copy}>{siteConfig.name}</p>
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
