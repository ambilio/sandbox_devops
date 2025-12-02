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
          setSuccess("Signup successful! Please login.");
          setIsSignup(false);
          setPassword("");
        } else {
          setError(res.error || "Signup failed");
        }
      } else {
        const res = await login(email, password);
        if (res.success && res.token) {
          onLogin();
        } else {
          setError(res.error || "Login failed");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div style={{ 
      maxWidth: "400px", 
      margin: "50px auto", 
      padding: "30px", 
      border: "1px solid #ddd", 
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        {isSignup ? "Sign Up" : "Login"}
      </h2>
      
      {error && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "15px", 
          backgroundColor: "#fee", 
          color: "#c33", 
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "15px", 
          backgroundColor: "#efe", 
          color: "#3c3", 
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Email"
          type="email"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxSizing: "border-box"
          }}
          disabled={loading}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxSizing: "border-box"
          }}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "15px"
        }}
      >
        {loading ? "Processing..." : (isSignup ? "Sign Up" : "Login")}
      </button>

      <div style={{ textAlign: "center", fontSize: "14px" }}>
        {isSignup ? (
          <span>
            Already have an account?{" "}
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                setIsSignup(false);
                setError("");
                setSuccess("");
              }}
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Login
            </a>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                setIsSignup(true);
                setError("");
                setSuccess("");
              }}
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Sign Up
            </a>
          </span>
        )}
      </div>
    </div>
  );
}
