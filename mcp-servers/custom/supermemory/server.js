"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 4001;
const mockStorage = new Map();
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
app.use(express_1.default.json());
app.get("/status", (req, res) => {
  res.json({ status: "ok", serverName: "supermemory" });
});
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    serverName: "supermemory",
    timestamp: new Date().toISOString(),
  });
});
// POST /record: Saves a new spiritual journey entry
app.post("/record", async (req, res) => {
  const { userId, entryType, data, synthesisPrompt } = req.body;
  if (!userId || !entryType) {
    return res
      .status(400)
      .json({ error: "userId and entryType are required." });
  }
  try {
    const newEntry = {
      id: generateId(),
      user_id: userId,
      entry_type: entryType,
      data,
      synthesis_prompt: synthesisPrompt,
      created_at: new Date().toISOString(),
    };
    if (!mockStorage.has(userId)) {
      mockStorage.set(userId, []);
    }
    mockStorage.get(userId).push(newEntry);
    console.log(`📝 Recorded entry for user ${userId}: ${entryType}`);
    res
      .status(201)
      .json({
        message: "Journey entry recorded successfully.",
        entry: newEntry,
      });
  } catch (err) {
    console.error("Unexpected error recording journey entry:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
// GET /journey/:userId: Retrieves all entries for a given user
app.get("/journey/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const journeyEntries = mockStorage.get(userId) || [];
    // Sort by created_at ascending
    journeyEntries.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    console.log(
      `🔍 Retrieved ${journeyEntries.length} entries for user ${userId}`,
    );
    res.status(200).json({ journey: journeyEntries });
  } catch (err) {
    console.error("Unexpected error retrieving journey entries:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.listen(port, () => {
  console.log(`Supermemory server listening at http://localhost:${port}`);
});
