import Link from "next/link";
import type { FC } from "react";
import styles from "./Breadcrumbs.module.css";

type BreadcrumbsProps = {
  items: { name: string; path: string }[];
};

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => (
  <nav aria-label="Brotkrumen" className={styles.nav}>
    <ol>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <li key={item.path}>
            {last ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.path}>{item.name}</Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
