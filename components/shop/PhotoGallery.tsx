"use client";

import { useState, type FC } from "react";
import { FramedPhoto } from "./FramedPhoto";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import styles from "./PhotoGallery.module.css";

type PhotoGalleryProps = {
  images: string[];
  title: string;
};

export const PhotoGallery: FC<PhotoGalleryProps> = ({ images, title }) => {
  const [active, setActive] = useState(0);
  const [openAt, setOpenAt] = useState(-1);
  const current = images[active] ?? images[0];

  if (!current) {
    return <p className={styles.empty}>Kein Foto vorhanden</p>;
  }

  return (
    <div className={styles.gallery}>
      <button type="button" className={styles.main} onClick={() => setOpenAt(active)}>
        <FramedPhoto src={current} alt={title} sizes="(max-width: 800px) 100vw, 560px" />
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
      <Lightbox
        open={openAt >= 0}
        close={() => setOpenAt(-1)}
        index={openAt >= 0 ? openAt : 0}
        slides={images.map((src) => ({ src, alt: title }))}
        plugins={[Thumbnails, Zoom, Fullscreen]}
      />
    </div>
  );
};
