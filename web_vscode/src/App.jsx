import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import { isAuthenticated } from "./api/auth";

export default function App() {
  const location = useLocation();

  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // 🔥 FIX: re-check auth on every route change
  useEffect(() => {
    const auth = isAuthenticated();
    setAuthenticated(auth);
    setAuthChecked(true);
  }, [location.pathname]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          authenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
