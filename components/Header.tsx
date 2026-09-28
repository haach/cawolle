import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {siteConfig.name}
        </Link>
        <nav aria-label="Hauptnavigation">
          <ul className={styles.nav}>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
