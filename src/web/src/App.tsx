import { useSearch } from "./hooks/useSearch";
import { useHistory } from "./hooks/useHistory";
import { useLightbox } from "./hooks/useLightbox";
import { Header } from "./components/Header";
import { SearchForm } from "./components/SearchForm";
import { SearchHistory } from "./components/SearchHistory";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { SkeletonGrid } from "./components/SkeletonGrid";
import { ResultsGrid } from "./components/ResultsGrid";
import { Lightbox } from "./components/Lightbox";

export default function App() {
  const { results, loading, error, search } = useSearch();
  const { items: historyItems, add: addHistory, clear: clearHistory } = useHistory();
  const { image: lightboxImage, open: openLightbox, close: closeLightbox } = useLightbox();

  function handleSearch(queries: string[], limit: number) {
    addHistory(queries.join(", "));
    search(queries, limit);
  }

  function handleSuggestion(query: string) {
    handleSearch([query], 20);
  }

  function handleSearchFromInput(raw: string) {
    const queries = raw
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);
    if (queries.length > 0) {
      handleSearch(queries, 20);
    }
  }

  return (
    <div className="min-h-screen bg-base">
      <Header />

      <main className="max-w-[1280px] mx-auto px-8 py-8 max-sm:px-4">
        <section className="mb-6">
          <SearchForm onSearch={handleSearch} loading={loading} />
          <SearchHistory
            items={historyItems}
            onSelect={(q) => handleSearchFromInput(q)}
            onClear={clearHistory}
          />
        </section>

        <div className="h-px bg-border mb-6" />

        <section className="min-h-[200px]" role="region" aria-label="Search results">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => {
                const queries = historyItems[0];
                if (queries) handleSearchFromInput(queries);
              }}
            />
          ) : results ? (
            <ResultsGrid results={results} onSelectImage={openLightbox} />
          ) : (
            <EmptyState onSuggestion={handleSuggestion} />
          )}
        </section>
      </main>

      <Lightbox image={lightboxImage} onClose={closeLightbox} />
    </div>
  );
}
