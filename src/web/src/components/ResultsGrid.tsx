import type { ScrapeResult } from "../types";
import { ImageCard } from "./ImageCard";
import type { ScrappedImage } from "../types";

interface ResultsGridProps {
  results: ScrapeResult[];
  onSelectImage: (img: ScrappedImage) => void;
}

export function ResultsGrid({ results, onSelectImage }: ResultsGridProps) {
  if (results.length === 0) {
    return <p className="text-sm text-muted text-center py-8">No results found.</p>;
  }

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {results.map((group) => {
        const groupIndex = globalIndex;

        return (
          <div key={group.query}>
            <div className="flex items-baseline gap-2 mb-4 pb-2 border-b border-border">
              <h2 className="font-serif text-xl leading-tight">
                <span className="text-accent">{group.query}</span>
              </h2>
              <span className="text-xs font-medium text-subtle">
                {group.images.length} image{group.images.length !== 1 ? "s" : ""}
              </span>
            </div>

            {group.error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-error-soft border border-error rounded-lg text-error text-sm mb-4">
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>{group.error}</span>
              </div>
            )}

            {group.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-[640px]:grid-cols-2 max-sm:gap-2">
                {group.images.map((img) => {
                  const card = (
                    <ImageCard
                      key={img.link + img.thumbnail}
                      image={img}
                      index={globalIndex}
                      onSelect={onSelectImage}
                    />
                  );
                  globalIndex++;
                  return card;
                })}
              </div>
            ) : !group.error ? (
              <p className="text-sm text-muted">
                No images found for <strong>{group.query}</strong>. Try different terms.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
