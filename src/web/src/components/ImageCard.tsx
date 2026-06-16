import { useState } from "react";
import type { ScrappedImage } from "../types";

interface ImageCardProps {
  image: ScrappedImage;
  index: number;
  onSelect: (img: ScrappedImage) => void;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ImageCard({ image, index, onSelect }: ImageCardProps) {
  const [imgError, setImgError] = useState(false);

  const delay = Math.min(index * 50, 400);

  return (
    <div
      className="bg-surface rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer relative transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] animate-card-in"
      style={{ animationDelay: `${delay}ms` }}
      tabIndex={0}
      role="button"
      aria-label={image.title || "Untitled"}
      onClick={() => onSelect(image)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(image);
        }
      }}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-base">
        {!imgError ? (
          <img
            src={image.thumbnail || image.link}
            alt={image.title || "Untitled"}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover block transition-transform duration-350 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-subtle">
            <svg
              className="w-7 h-7 opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-overlay to-transparent opacity-0 transition-opacity duration-250 hover:opacity-100 flex flex-col justify-end p-4">
          <span className="text-white text-sm font-medium line-clamp-2 leading-relaxed">
            {image.title || "Untitled"}
          </span>
          {image.source && (
            <span className="text-white/70 text-xs font-medium mt-0.5 truncate">
              {extractDomain(image.source)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
