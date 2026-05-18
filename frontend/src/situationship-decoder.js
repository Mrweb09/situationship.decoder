import { useState } from "react";

export default function App() {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyseConversation = async () => {
    if (!conversation.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_KEY_REMOVED",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a brutally honest but fun relationship analyst called the Situationship Decoder. 
              Analyse this conversation and respond ONLY with a JSON object in this exact format, no other text:
              {
                "verdict": "one punchy sentence on where they stand",
                "status": "one of: Ghosting Incoming / Breadcrumbing / Lowkey Interested / Catching Feelings / Rizz Detected",
                "confidence": a number between 0 and 100,
                "explanation": "2-3 sentences of brutal honest analysis",
                "replies": ["reply option 1", "reply option 2", "reply option 3"]
              }
              
              Here is the conversation to analyse:
              ${conversation}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content[0].text;
      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check your API key.");
    }

    setLoading(false);
  };

  const statusColors = {
    "Ghosting Incoming": "#ff4444",
    "Breadcrumbing": "#ff8800",
    "Lowkey Interested": "#ffcc00",
    "Catching Feelings": "#44bbff",
    "Rizz Detected": "#44ff88",
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💀 Situationship Decoder</h1>
        <p style={styles.subtitle}>Find out where you actually stand</p>

        {!result && (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Paste your conversation here... (copy and paste your texts)"
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
            />
            <button
              style={styles.button}
              onClick={analyseConversation}
              disabled={loading}
            >
              {loading ? "Decoding... 👀" : "Decode My Situation 💀"}
            </button>
          </>
        )}

        {result && (
          <div style={styles.results}>
            <div
              style={{
                ...styles.statusBadge,
                backgroundColor: statusColors[result.status] + "22",
                border: `1px solid ${statusColors[result.status]}`,
                color: statusColors[result.status],
              }}
            >
              {result.status}
            </div>

            <h2 style={styles.verdict}>"{result.verdict}"</h2>

            <div style={styles.confidenceContainer}>
              <p style={styles.confidenceLabel}>
                Interest Level: {result.confidence}%
              </p>
              <div style={styles.confidenceBar}>
                <div
                  style={{
                    ...styles.confidenceFill,
                    width: `${result.confidence}%`,
                    backgroundColor:
                      result.confidence > 60
                        ? "#44ff88"
                        : result.confidence > 30
                        ? "#ffcc00"
                        : "#ff4444",
                  }}
                />
              </div>
            </div>

            <p style={styles.explanation}>{result.explanation}</p>

            <div style={styles.repliesSection}>
              <p style={styles.repliesTitle}>🔥 How to Reply:</p>
              {result.replies.map((reply, i) => (
                <div
                  key={i}
                  style={styles.replyCard}
                  onClick={() => {
                    navigator.clipboard.writeText(reply);
                    alert("Copied!");
                  }}
                >
                  <span style={styles.replyLabel}>
                    {i === 0 ? "😇 Safe" : i === 1 ? "😏 Bold" : "💀 Unhinged"}
                  </span>
                  <p style={styles.replyText}>{reply}</p>
                  <span style={styles.copyHint}>tap to copy</span>
                </div>
              ))}
            </div>

            <button
              style={styles.resetButton}
              onClick={() => {
                setResult(null);
                setConversation("");
              }}
            >
              Decode Another 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a1f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "600px",
    width: "100%",
    backdropFilter: "blur(20px)",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "0.95rem",
  },
  textarea: {
    width: "100%",
    minHeight: "180px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "16px",
    color: "white",
    fontSize: "0.95rem",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "0.05em",
  },
  verdict: {
    color: "white",
    fontSize: "1.3rem",
    fontWeight: "700",
    margin: "0",
    lineHeight: "1.4",
  },
  confidenceContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  confidenceLabel: {
    color: "rgba(255,255,255,0.6)",
    margin: "0",
    fontSize: "0.9rem",
  },
  confidenceBar: {
    height: "8px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 1s ease",
  },
  explanation: {
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.6",
    margin: "0",
    fontSize: "0.95rem",
  },
  repliesSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  repliesTitle: {
    color: "white",
    fontWeight: "700",
    margin: "0",
    fontSize: "1rem",
  },
  replyCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  replyLabel: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.4)",
    fontWeight: "700",
    letterSpacing: "0.05em",
  },
  replyText: {
    color: "white",
    margin: "6px 0 4px 0",
    fontSize: "0.95rem",
    lineHeight: "1.4",
  },
  copyHint: {
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.25)",
  },
  resetButton: {
    width: "100%",
    padding: "14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};