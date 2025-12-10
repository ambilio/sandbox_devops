import { useEffect } from "react";

export default function Landing({ onGetStarted }) {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.fontFamily =
      "Inter, system-ui, -apple-system, BlinkMacSystemFont";
  }, []);

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✨</div>
          <strong>Embedding Sandbox</strong>
        </div>

        <button style={styles.loginBtn} onClick={onGetStarted}>
          Get Started →
        </button>
      </nav>

      {/* HERO */}
      <main style={styles.hero}>
        <h1 style={styles.title}>
          Embedding Sandbox <br />
          <span style={styles.gradient}>for AI Builders</span>
        </h1>

        <p style={styles.subtitle}>
          Build, test, and deploy embeddings, agents, vector databases,
          and cloud workflows in isolated environments.
        </p>

        <button style={styles.primaryBtn} onClick={onGetStarted}>
          Start Building →
        </button>

        <p style={styles.meta}>
          No local setup • VS Code • Jupyter • LangFlow • Vector DBs
        </p>
      </main>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #f5f3ff, #eef2ff, #ffffff)",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "18px 32px",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #eee",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 18,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  hero: {
    padding: "120px 24px 80px",
    textAlign: "center",
    maxWidth: 900,
    margin: "0 auto",
  },
  title: {
    fontSize: 64,
    margin: 0,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  gradient: {
    background:
      "linear-gradient(90deg,#8b5cf6,#22c55e,#0ea5e9)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  subtitle: {
    marginTop: 24,
    fontSize: 18,
    color: "#555",
  },
  primaryBtn: {
    marginTop: 40,
    padding: "18px 32px",
    borderRadius: 14,
    fontSize: 16,
    border: "none",
    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  meta: {
    marginTop: 28,
    fontSize: 13,
    color: "#666",
  },
};
