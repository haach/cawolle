import Image from "next/image";
import type { FC } from "react";
import { siteConfig } from "@/services/site";
import styles from "./Hero.module.css";

export const Hero: FC = () => (
  <section className={styles.hero}>
    <Image src="/hero-banner.jpg" alt="" fill sizes="100vw" preload className={styles.background} />
    <div className={styles.overlay}>
      <Image
        src="/logo.png"
        alt={siteConfig.name}
        width={647}
        height={280}
        loading="eager"
        fetchPriority="high"
        className={styles.logo}
      />
    </div>
  </section>
);
