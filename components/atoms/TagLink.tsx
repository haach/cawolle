import Link, { type LinkProps } from "next/link";
import type { FC, PropsWithChildren } from "react";
import styles from "./TagLink.module.css";

export const TagLink: FC<PropsWithChildren<LinkProps>> = ({ children, ...linkProps }) => {
  return (
    <Link className={styles.tag} {...linkProps}>
      {children}
    </Link>
  );
};

export const TagLinkList: FC<PropsWithChildren<{ links: Array<PropsWithChildren<LinkProps>> }>> = ({
  links,
}) => {
  return (
    <ul className={styles.links}>
      {links.map((link) => (
        <li key={link.href.toString()}>
          <TagLink {...link}>{link.children}</TagLink>
        </li>
      ))}
    </ul>
  );
};
