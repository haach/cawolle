import type { FC } from "react";
import Image from "next/image";
import styles from "./FramedPhoto.module.css";

type FramedPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
};

export const FramedPhoto: FC<FramedPhotoProps> = ({ src, alt, sizes, preload = false }) => (
  <>
    <Image src={src} alt="" fill sizes={sizes} aria-hidden className={styles.backdrop} />
    <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className={styles.photo} />
  </>
);
