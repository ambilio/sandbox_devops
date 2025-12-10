import { useState } from "react";
import { login, signup } from "../api/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignup) {
        const res = await signup(email, password);
        if (res.success) {
          setSuccess("Account created! Please login.");
          setIsSignup(false);
          setPassword("");
        } else {
          setError(res.error || "Signup failed");
        }
      } else {
        const res = await login(email, password);
        if (res.success && res.token) onLogin();
        else setError(res.error || "Login failed");
      }
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Agentic Workspace</h1>
        <p style={subtitle}>
          {isSignup ? "Create your account" : "Sign in to continue"}
        </p>

        {/* Messages */}
        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={successBox}>{success}</div>}

        {/* Email */}
        <div style={field}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            disabled={loading}
            style={input}
          />
          <label style={label}>Email</label>
        </div>

        {/* Password */}
        <div style={field}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            disabled={loading}
            style={input}
          />
          <label style={label}>Password</label>
        </div>

        {/* Action */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...button,
            background: loading
              ? "#999"
              : "linear-gradient(135deg,#6c63ff,#5a54e8)",
          }}
        >
          {loading ? "Processing…" : isSignup ? "Create Account" : "Login"}
        </button>

        {/* Switch */}
        <div style={switchText}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span onClick={() => switchMode(false)} style={link}>
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span onClick={() => switchMode(true)} style={link}>
                Sign up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  function switchMode(v) {
    setIsSignup(v);
    setError("");
    setSuccess("");
  }
}

/* ======================= STYLES ======================= */

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #6c63ff33, transparent 40%), linear-gradient(135deg,#0f1225,#1c2040)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const card = {
  width: 380,
  padding: "36px 32px",
  borderRadius: 20,
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
  color: "#fff",
};

const title = {
  margin: 0,
  textAlign: "center",
  fontSize: 26,
};

const subtitle = {
  textAlign: "center",
  fontSize: 14,
  opacity: 0.85,
  marginBottom: 30,
};

const field = {
  position: "relative",
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: "14px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  fontSize: 15,
  outline: "none",
};

const label = {
  position: "absolute",
  top: 12,
  left: 12,
  fontSize: 13,
  opacity: 0.6,
  pointerEvents: "none",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 10,
};

const switchText = {
  marginTop: 20,
  textAlign: "center",
  fontSize: 13,
  opacity: 0.8,
};

const link = {
  color: "#6c63ff",
  cursor: "pointer",
  fontWeight: 600,
};

const errorBox = {
  background: "rgba(255,0,0,0.15)",
  padding: 10,
  borderRadius: 8,
  fontSize: 13,
  marginBottom: 12,
};

const successBox = {
  background: "rgba(0,255,0,0.15)",
  padding: 10,
  borderRadius: 8,
  fontSize: 13,
  marginBottom: 12,
};
