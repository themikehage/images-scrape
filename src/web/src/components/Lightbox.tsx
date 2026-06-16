import { useEffect, useRef, useState } from "react";
import type { ScrappedImage } from "../types";

interface LightboxProps {
  image: ScrappedImage | null;
  onClose: () => void;
}

export function Lightbox({ image, onClose }: LightboxProps) {
  const [loading, setLoading] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (image) {
      setLoading(true);
      closeRef.current?.focus();
    }
  }, [image]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && image) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [image, onClose]);

  if (!image) return null;

  const src = image.link || image.thumbnail || "";
  const title = image.title || "Untitled";

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-250"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="relative max-w-[90vw] max-h-[90vh] bg-surface rounded-2xl overflow-hidden shadow-[0_20px_25px_rgba(0,0,0,0.1)] flex flex-col">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full border-none bg-black/50 text-white cursor-pointer flex items-center justify-center transition-colors duration-150 hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-center justify-center bg-[#1a1a1a] min-h-[200px] max-h-[70vh] overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 border-3 border-white/15 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={title}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            className="max-w-full max-h-[70vh] object-contain block"
          />
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{title}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            {image.source && (
              <a
                href={image.source}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[38px] px-4 rounded-lg border border-border bg-transparent text-muted text-sm font-semibold inline-flex items-center gap-1.5 no-underline cursor-pointer transition-[background,color] duration-150 hover:bg-base hover:text-text hover:border-border-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Source
              </a>
            )}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[38px] px-4 rounded-lg bg-accent text-white text-sm font-semibold inline-flex items-center gap-1.5 no-underline cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Open full size
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
