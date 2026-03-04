import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("history.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    analysis_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/history", (req, res) => {
    const { imageUrl, analysis } = req.body;
    const stmt = db.prepare("INSERT INTO history (image_url, analysis_json) VALUES (?, ?)");
    const info = stmt.run(imageUrl, JSON.stringify(analysis));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM history ORDER BY created_at DESC").all();
    res.json(rows.map(row => ({
      ...row,
      analysis: JSON.parse(row.analysis_json as string)
    })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
