"use client";

import dynamic from "next/dynamic";
import { useState, type FC } from "react";
import { Spacing, Typography } from "@/components/atoms";
import { FramedPhoto } from "./FramedPhoto";
import styles from "./PhotoGallery.module.css";

const OfferLightbox = dynamic(
  () => import("./OfferLightbox").then((module) => module.OfferLightbox),
  {
    ssr: false,
  },
);

type PhotoGalleryProps = {
  images: string[];
  title: string;
};

export const PhotoGallery: FC<PhotoGalleryProps> = ({ images, title }) => {
  const [active, setActive] = useState(0);
  const [openAt, setOpenAt] = useState(-1);
  const current = images[active] ?? images[0];

  if (!current) {
    return <Typography>Kein Foto vorhanden</Typography>;
  }

  return (
    <Spacing space={15} alignItems="stretch">
      <button type="button" className={styles.main} onClick={() => setOpenAt(active)}>
        <FramedPhoto
          src={current}
          alt={title}
          sizes="(max-width: 800px) 100vw, 560px"
          preload={active === 0}
        />
      </button>
      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                className={styles.thumb}
                aria-current={index === active}
                aria-label={`Foto ${index + 1} von ${images.length}`}
                onClick={() => setActive(index)}
              >
                <FramedPhoto src={src} alt="" sizes="88px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={styles.open} onClick={() => setOpenAt(active)}>
        {images.length > 1 ? "Alle Fotos anzeigen" : "Foto vergrößern"}
      </button>
      {openAt >= 0 && (
        <OfferLightbox images={images} title={title} index={openAt} onClose={() => setOpenAt(-1)} />
      )}
    </Spacing>
  );
};
