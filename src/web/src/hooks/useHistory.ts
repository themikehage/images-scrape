import { useState, useCallback } from "react";

const HISTORY_KEY = "imgscraper_history";
const MAX_HISTORY = 6;

function readHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeHistory(list: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

interface UseHistoryReturn {
  items: string[];
  add: (raw: string) => void;
  clear: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [items, setItems] = useState<string[]>(readHistory);

  const add = useCallback((raw: string) => {
    const normalized = raw.toLowerCase().trim();
    let list = readHistory().filter(
      (h) => h.toLowerCase().trim() !== normalized
    );
    list.unshift(raw.trim());
    if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
    writeHistory(list);
    setItems(list);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setItems([]);
  }, []);

  return { items, add, clear };
}
