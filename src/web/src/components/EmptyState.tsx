interface EmptyStateProps {
  onSuggestion: (query: string) => void;
}

const SUGGESTIONS = ["roma", "paris", "tokyo", "new york", "barcelona"];

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg
        className="w-14 h-14 text-border-strong mb-6"
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
      <h2 className="font-serif text-2xl mb-2">Search for images</h2>
      <p className="text-sm text-muted max-w-[400px] leading-relaxed">
        Enter one or more terms separated by commas to find images from Bing.
      </p>
      <div className="flex gap-2 mt-6 flex-wrap justify-center">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="px-4 py-1.5 bg-accent-soft border border-transparent rounded-full text-accent text-sm font-medium cursor-pointer transition-[background,border-color] duration-150 hover:bg-surface hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
