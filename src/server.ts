import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { scrapeMultiple } from "./scraper.js";
import { scrapeWebMultiple } from "./parsers/web.js";
import { scrapeVideoMultiple } from "./parsers/videos.js";
import { scrapeNewsMultiple } from "./parsers/news.js";
import { ScrapeResponse, WebSearchResponse, VideoSearchResponse, NewsSearchResponse } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.post("/api/video-search", async (req, res) => {
  try {
    const { queries, limit } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      res.status(400).json({ success: false, error: "queries must be a non-empty array" });
      return;
    }

    const maxLimit = 20;
    const actualLimit = limit && typeof limit === "number" ? Math.min(limit, maxLimit) : 10;

    const results = await scrapeVideoMultiple(queries, actualLimit);
    const response: VideoSearchResponse = { success: true, results };
    res.json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

app.post("/api/news-search", async (req, res) => {
  try {
    const { queries, limit, region } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      res.status(400).json({ success: false, error: "queries must be a non-empty array" });
      return;
    }

    const maxLimit = 20;
    const actualLimit = limit && typeof limit === "number" ? Math.min(limit, maxLimit) : 10;

    const results = await scrapeNewsMultiple(queries, actualLimit, region);
    const response: NewsSearchResponse = { success: true, results };
    res.json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

app.post("/api/web-search", async (req, res) => {
  try {
    const { queries, limit, region } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      res.status(400).json({ success: false, error: "queries must be a non-empty array" });
      return;
    }

    const maxLimit = 20;
    const actualLimit = limit && typeof limit === "number" ? Math.min(limit, maxLimit) : 10;

    const results = await scrapeWebMultiple(queries, actualLimit, region);
    const response: WebSearchResponse = { success: true, results };
    res.json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

app.post("/api/scrape", async (req, res) => {
  try {
    const { queries, limit } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      res.status(400).json({ success: false, error: "queries must be a non-empty array" });
      return;
    }

    const maxLimit = 50;
    const actualLimit = limit && typeof limit === "number" ? Math.min(limit, maxLimit) : 20;

    const results = await scrapeMultiple(queries, actualLimit);
    const response: ScrapeResponse = { success: true, results };
    res.json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
