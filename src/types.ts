export interface ScrappedImage {
  title: string;
  link: string;
  thumbnail: string;
  source: string;
  width?: number;
  height?: number;
}

export interface ScrapeRequest {
  queries: string[];
  limit?: number;
}

export interface ScrapeResult {
  query: string;
  images: ScrappedImage[];
  error?: string;
}

export interface ScrapeResponse {
  success: boolean;
  results: ScrapeResult[];
  error?: string;
}

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResult {
  query: string;
  results: WebResult[];
  error?: string;
}

export interface WebSearchResponse {
  success: boolean;
  results: WebSearchResult[];
  error?: string;
}

export interface VideoResult {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  source: string;
  channel: string;
  views: string;
}

export interface VideoSearchResult {
  query: string;
  results: VideoResult[];
  error?: string;
}

export interface VideoSearchResponse {
  success: boolean;
  results: VideoSearchResult[];
  error?: string;
}
