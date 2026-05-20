import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to fetch Thai Navy Time / NIMT
  // We'll try to fetch and parse, but provide a robust fallback
  app.get("/api/time", async (req, res) => {
    const sources = [
      { url: "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Bangkok", key: "dateTime", name: "TimeAPI.io" },
      { url: "https://worldtimeapi.org/api/timezone/Asia/Bangkok", key: "datetime", name: "WorldTimeAPI" },
      { url: "https://worldclockapi.com/api/json/utc/now", key: "currentDateTime", name: "WorldClockAPI" } // Note: returns UTC
    ];

    for (const source of sources) {
      try {
        const response = await axios.get(source.url, { 
          timeout: 4000,
          headers: { 'Accept': 'application/json', 'User-Agent': 'NB888-App' }
        });
        
        let datetime = response.data[source.key];
        
        // Handle WorldClockAPI specifically as it's UTC and might need offset if we didn't use a zone endpoint
        if (source.name === "WorldClockAPI") {
          // Add 7 hours for Bangkok
          const date = new Date(datetime);
          date.setHours(date.getHours() + 7);
          datetime = date.toISOString();
        }

        if (datetime) {
          return res.json({ 
            datetime: datetime,
            source: `NIMT Sync (${source.name})`
          });
        }
      } catch (err) {
        console.error(`Time sync source ${source.name} failed:`, err instanceof Error ? err.message : err);
      }
    }

    // If all fail
    res.json({ 
      datetime: new Date().toISOString(),
      source: "System Time (Local Fallback)"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
