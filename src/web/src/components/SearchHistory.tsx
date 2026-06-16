interface SearchHistoryProps {
  items: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export function SearchHistory({ items, onSelect, onClear }: SearchHistoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1 flex-wrap">
      <span className="text-xs font-semibold text-subtle uppercase tracking-wide">
        Recent
      </span>
      <div className="flex gap-1 flex-wrap">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="px-3 py-0.5 bg-accent-soft border border-transparent rounded-full text-accent text-xs font-medium cursor-pointer transition-[background,border-color] duration-150 hover:bg-surface hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {q}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="py-0.5 px-2 bg-transparent border-none text-subtle text-[0.7rem] font-medium cursor-pointer underline underline-offset-2 transition-colors duration-150 hover:text-error"
      >
        Clear
      </button>
    </div>
  );
}
