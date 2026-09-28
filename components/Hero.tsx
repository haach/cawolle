import Image from "next/image";
import { siteConfig } from "@/lib/site";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src="/hero-banner.jpg"
        alt=""
        fill
        sizes="100vw"
        preload
        className={styles.background}
      />
      <div className={styles.overlay}>
        <Image
          src="/logo.png"
          alt={siteConfig.name}
          width={647}
          height={280}
          className={styles.logo}
        />
      </div>
    </section>
  );
}
