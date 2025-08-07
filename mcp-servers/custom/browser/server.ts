import express from "express";

const app = express();
const port = 4004;

app.get("/status", (req, res) => {
  res.json({ status: "ok", serverName: "browser" });
});

app.listen(port, () => {
  console.log(`Browser server listening at http://localhost:${port}`);
});
