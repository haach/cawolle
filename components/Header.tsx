import Image from "next/image";
import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={647}
            height={280}
            priority
            className={styles.logo}
          />
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
