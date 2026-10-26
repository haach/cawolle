"use client";

import type { FC } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

type OfferLightboxProps = {
  images: string[];
  title: string;
  index: number;
  onClose: () => void;
};

export const OfferLightbox: FC<OfferLightboxProps> = ({ images, title, index, onClose }) => (
  <Lightbox
    open
    close={onClose}
    index={index}
    slides={images.map((src) => ({ src, alt: title }))}
    plugins={[Thumbnails, Zoom, Fullscreen]}
  />
);
