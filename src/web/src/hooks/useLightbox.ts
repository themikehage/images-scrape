import { useState, useCallback } from "react";
import type { ScrappedImage } from "../types";

interface UseLightboxReturn {
  image: ScrappedImage | null;
  open: (img: ScrappedImage) => void;
  close: () => void;
}

export function useLightbox(): UseLightboxReturn {
  const [image, setImage] = useState<ScrappedImage | null>(null);

  const open = useCallback((img: ScrappedImage) => {
    setImage(img);
    document.body.classList.add("overflow-hidden");
  }, []);

  const close = useCallback(() => {
    setImage(null);
    document.body.classList.remove("overflow-hidden");
  }, []);

  return { image, open, close };
}
