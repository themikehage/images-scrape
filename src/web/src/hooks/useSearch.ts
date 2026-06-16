import { useState, useCallback } from "react";
import type { ScrapeResult, ScrapeResponse } from "../types";

const API = "/api/scrape";

interface UseSearchReturn {
  results: ScrapeResult[] | null;
  loading: boolean;
  error: string | null;
  search: (queries: string[], limit: number) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<ScrapeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (queries: string[], limit: number) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries, limit }),
      });

      const data: ScrapeResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Server error");
        return;
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
