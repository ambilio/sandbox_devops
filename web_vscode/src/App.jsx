import { useState, useEffect } from "react";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import { isAuthenticated } from "./api/auth";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("landing"); // landing | login | dashboard

  useEffect(() => {
    const auth = isAuthenticated();
    setAuthenticated(auth);
    setView(auth ? "dashboard" : "landing");
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "#666",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {view === "landing" && (
        <Landing
          onGetStarted={() =>
            setView(authenticated ? "dashboard" : "login")
          }
        />
      )}

      {view === "login" && (
        <Login
          onLogin={() => {
            setAuthenticated(true);
            setView("dashboard");
          }}
        />
      )}

      {view === "dashboard" && (
        <Dashboard
          onLogout={() => {
            setAuthenticated(false);
            setView("landing");
          }}
        />
      )}
    </>
  );
}
