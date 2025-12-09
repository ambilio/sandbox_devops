import { useEffect, useState } from "react";
import {
  listInstances,
  createInstance,
  startInstance,
  stopInstance,
} from "../api/instances";
import { logout } from "../api/auth";

export default function Dashboard({ onLogout }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  // actionLoading key: `${id}-${type}` → "start" | "stop"
  const [actionLoading, setActionLoading] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    const res = await listInstances();

    if (res.success) {
      setInstances(res.instances || []);
    } else {
      setError(res.error || "Failed to load instances");
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => handleLogout(), 1500);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // 🔹 Create instance of a specific type: "vscode" or "jupyter"
  async function handleCreate(type) {
    setCreating(true);
    setError("");

    const res = await createInstance(type, 12); // 12 hour TTL

    if (res.success) {
      await load();
    } else {
      setError(res.error || `Failed to create ${type} instance`);
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => handleLogout(), 1500);
      }
    }

    setCreating(false);
  }

  // 🔹 Start instance for its type
  async function handleStart(id, type) {
    const key = `${id}-${type}`;
    setActionLoading((prev) => ({ ...prev, [key]: "start" }));
    setError("");

    const res = await startInstance(id, type);

    if (res.success) {
      await load();
    } else {
      setError(res.error || `Failed to start ${type} instance`);
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => handleLogout(), 1500);
      }
    }

    setActionLoading((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // 🔹 Stop instance for its type
  async function handleStop(id, type) {
    const key = `${id}-${type}`;
    setActionLoading((prev) => ({ ...prev, [key]: "stop" }));
    setError("");

    const res = await stopInstance(id, type);

    if (res.success) {
      await load();
    } else {
      setError(res.error || `Failed to stop ${type} instance`);
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => handleLogout(), 1500);
      }
    }

    setActionLoading((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleLogout() {
    logout();
    if (onLogout) onLogout();
  }

  // Helper: ALB URL based on instance type
  function getWorkspaceUrl(inst) {
    if (inst.type === "vscode") {
      return "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/vscode_backend/";
    }
    if (inst.type === "jupyter") {
      return "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/jupyter_backend/";
    }
    return "#";
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "2px solid #eee",
        }}
      >
        <h1 style={{ margin: 0 }}>Instance Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            color: "#c33",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* 🔹 Create VS Code / Jupyter separately */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <button
          onClick={() => handleCreate("vscode")}
          disabled={creating || loading}
          style={{
            padding: "12px 24px",
            backgroundColor: creating ? "#6c8ad4" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: creating ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {creating ? "Creating..." : "Create VS Code Instance"}
        </button>

        <button
          onClick={() => handleCreate("jupyter")}
          disabled={creating || loading}
          style={{
            padding: "12px 24px",
            backgroundColor: creating ? "#f1b067" : "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: creating ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {creating ? "Creating..." : "Create Jupyter Instance"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading instances...
        </div>
      ) : instances.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#666",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          No instances found. Create a VS Code or Jupyter instance to get
          started.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {instances.map((inst) => {
            const type = inst.type; // 'vscode' or 'jupyter'
            const keyStart = `${inst.id}-${type}`;
            const isStarting = actionLoading[keyStart] === "start";
            const isStopping = actionLoading[keyStart] === "stop";

            return (
              <div
                key={inst.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  {type === "vscode" ? "VS Code Instance" : "Jupyter Instance"}{" "}
                  ({inst.id?.substring(0, 8) || "N/A"})
                </h3>

                <div style={{ marginBottom: "10px", color: "#666" }}>
                  <strong>Type:</strong>{" "}
                  {type === "vscode" ? "VS Code" : "Jupyter Notebook"}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        inst.status === "running"
                          ? "#d4edda"
                          : inst.status === "stopped"
                          ? "#f8d7da"
                          : "#fff3cd",
                      color:
                        inst.status === "running"
                          ? "#155724"
                          : inst.status === "stopped"
                          ? "#721c24"
                          : "#856404",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {inst.status || "unknown"}
                  </span>
                </div>

                {/* Open button when running */}
                {inst.status === "running" && (
                  <div style={{ marginBottom: "15px" }}>
                    <a
                      href={getWorkspaceUrl(inst)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Open {type === "vscode" ? "VS Code" : "Jupyter"}
                    </a>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    onClick={() => handleStart(inst.id, type)}
                    disabled={
                      isStarting || inst.status === "running" || loading
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor:
                        inst.status === "running" ? "#ccc" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor:
                        inst.status === "running" || isStarting
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {isStarting ? "Starting..." : "Start"}
                  </button>

                  <button
                    onClick={() => handleStop(inst.id, type)}
                    disabled={
                      isStopping || inst.status === "stopped" || loading
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor:
                        inst.status === "stopped" ? "#ccc" : "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor:
                        inst.status === "stopped" || isStopping
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {isStopping ? "Stopping..." : "Stop"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
