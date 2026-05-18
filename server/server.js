console.log("Starting server...");

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const STATS_FILE = path.join(__dirname, "stats.json");

function readStats() {
  try {
    if (fs.existsSync(STATS_FILE)) return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  } catch {}
  return { totalVotes: 0, accurateVotes: 0, statusCounts: {} };
}

function writeStats(stats) {
  try { fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2)); } catch {}
}

// ─── Analyse ───────────────────────────────────────────────────────────────
app.post("/analyse", async (req, res) => {
  try {
    const { conversation } = req.body;
    if (!conversation) return res.status(400).json({ error: "No conversation provided" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `You are the Situationship Decoder — brutally honest, sharp-tongued, zero patience for delusion. Analyse the conversation and respond ONLY with valid JSON. No markdown, no backticks, nothing outside the JSON.

Format (follow exactly):
{"verdict":"string","status":"string","confidence":number,"explanation":"string","replies":["string","string","string"],"translations":[{"said":"string","actually":"string"}]}

Rules:
- verdict: One punchy specific sentence. Reference actual behaviour from the conversation. Be direct and a little savage.
- status: EXACTLY one of: Ghosting Incoming / Breadcrumbing / Lowkey Interested / Catching Feelings / Rizz Detected
- confidence: Integer 0–100, how interested THEY are (not how interested the user is).
- explanation: 2–3 sentences of sharp honest analysis. Call out specific patterns in THIS conversation.
- replies: Exactly 3 replies tailored to this conversation:
  [0] Safe — low-effort, chill, doesn't show cards
  [1] Bold — genuine interest, slightly flirty, has confidence
  [2] Unhinged — chaotic, funny, the 2am text you regret
- translations: Pick 3–5 of the most telling messages from THEIR side only (not the user's messages). For each, write exactly what they said and what it actually meant. Be specific — translate mixed signals, vague language, and emotional avoidance into plain English. Example: {"said":"omg been so busy lately","actually":"I saw your text and needed 3 days to decide if I liked you enough to reply"}

Conversation:
${conversation}`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let parsed;
    try { parsed = JSON.parse(text); }
    catch { return res.status(500).json({ error: "Invalid AI response", raw: text }); }

    // Record status in stats
    if (parsed.status) {
      const stats = readStats();
      stats.statusCounts = stats.statusCounts || {};
      stats.statusCounts[parsed.status] = (stats.statusCounts[parsed.status] || 0) + 1;
      writeStats(stats);
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Rate accuracy ─────────────────────────────────────────────────────────
app.post("/rate", (req, res) => {
  const { accurate } = req.body;
  if (typeof accurate !== "boolean") return res.status(400).json({ error: "accurate must be boolean" });
  const stats = readStats();
  stats.totalVotes = (stats.totalVotes || 0) + 1;
  if (accurate) stats.accurateVotes = (stats.accurateVotes || 0) + 1;
  writeStats(stats);
  res.json({ success: true });
});

// ─── Stats ─────────────────────────────────────────────────────────────────
app.get("/stats", (req, res) => {
  const stats = readStats();
  const total = Object.values(stats.statusCounts || {}).reduce((a, b) => a + b, 0);
  const accuracyPct = stats.totalVotes > 0
    ? Math.round((stats.accurateVotes / stats.totalVotes) * 100)
    : null;
  res.json({ ...stats, total, accuracyPct });
});

// ─── Stripe checkout ───────────────────────────────────────────────────────
// Activate by adding STRIPE_SECRET_KEY, STRIPE_MONTHLY_PRICE_ID, STRIPE_ANNUAL_PRICE_ID to server/.env
app.post("/create-checkout-session", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({ error: "Payments not configured yet. Add STRIPE_SECRET_KEY to server/.env" });
  }
  try {
    const { plan = "monthly" } = req.body;
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const priceId = plan === "annual"
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : (process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/decode?success=true`,
      cancel_url: `${appUrl}/decode`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
