import Link, { type LinkProps } from "next/link";
import type { FC, PropsWithChildren } from "react";
import styles from "./TagLink.module.css";

type TagLinkProps = PropsWithChildren<LinkProps> & { backgroundColor?: string };

export const TagLink: FC<TagLinkProps> = ({ children, backgroundColor, ...linkProps }) => {
  return (
    <Link className={styles.tag} style={{ backgroundColor }} {...linkProps}>
      {children}
    </Link>
  );
};

export const TagLinkList: FC<PropsWithChildren<{ links: Array<TagLinkProps> }>> = ({ links }) => {
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
