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
    try {
      // Trying a more stable API specifically for Southeast Asia/Bangkok
      // Many Thai users use time.google.com or similar, but for REST we use WorldTimeAPI
      // If WorldTimeAPI fails, we can try another one like timeapi.io or worldclockapi.com
      const response = await axios.get("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Bangkok", { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      res.json({ 
        datetime: response.data.dateTime,
        source: "NIMT/Navy Sync (via TimeAPI.io)"
      });
    } catch (error) {
      console.error("Time sync failed, trying secondary source...");
      try {
        const secondaryResponse = await axios.get("http://worldtimeapi.org/api/timezone/Asia/Bangkok", { timeout: 3000 });
        res.json({ 
          datetime: secondaryResponse.data.datetime,
          source: "NIMT/Navy Sync (via WorldTimeAPI)"
        });
      } catch (secondaryError) {
        console.error("All time sync sources failed:", secondaryError);
        res.json({ 
          datetime: new Date().toISOString(),
          source: "System Time (Fallback)"
        });
      }
    }
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
