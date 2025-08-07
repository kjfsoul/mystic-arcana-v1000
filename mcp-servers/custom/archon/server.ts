import express from "express";

const app = express();
const port = 4003;

app.get("/status", (req, res) => {
  res.json({ status: "ok", serverName: "archon" });
});

app.listen(port, () => {
  console.log(`Archon server listening at http://localhost:${port}`);
});
