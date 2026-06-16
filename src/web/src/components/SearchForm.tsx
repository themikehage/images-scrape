import { useState, type FormEvent } from "react";

interface SearchFormProps {
  onSearch: (queries: string[], limit: number) => void;
  loading: boolean;
}

const LIMIT_OPTIONS = [10, 20, 30, 50];

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [input, setInput] = useState("");
  const [limit, setLimit] = useState(20);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const queries = input
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);
    if (queries.length === 0) return;
    onSearch(queries, limit);
  }

  return (
    <section className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2 items-stretch max-sm:flex-col" role="search">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="roma, paris, tokyo"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search terms separated by commas"
            className="w-full h-14 pl-12 pr-4 bg-surface border-2 border-border rounded-xl text-base text-text outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] font-sans"
          />
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          aria-label="Results per query"
          className="h-14 px-4 pr-9 bg-surface border-2 border-border rounded-xl text-sm font-medium text-text outline-none cursor-pointer transition-[border-color,box-shadow] duration-150 hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] min-w-[100px] appearance-none font-sans"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
        >
          {LIMIT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          aria-label="Search"
          className="h-14 px-7 bg-accent text-white border-none rounded-xl font-sans text-sm font-semibold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-[background,transform] duration-150 hover:bg-accent-hover active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none max-sm:w-full max-sm:justify-center"
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>{loading ? "Searching\u2026" : "Search"}</span>
        </button>
      </form>

      <p className="text-sm text-subtle mt-1 pl-0.5">
        Enter search terms separated by commas
      </p>
    </section>
  );
}
