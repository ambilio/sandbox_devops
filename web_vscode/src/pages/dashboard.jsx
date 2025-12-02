import { useEffect, useState } from "react";
import { listInstances, createInstance, startInstance, stopInstance } from "../api/instances";
import { logout } from "../api/auth";

export default function Dashboard({ onLogout }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
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
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError("");
    const res = await createInstance("workspace", 12);
    
    if (res.success) {
      await load();
    } else {
      setError(res.error || "Failed to create instance");
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    }
    setCreating(false);
  }

  async function handleStart(id) {
    setActionLoading(prev => ({ ...prev, [id]: "start" }));
    setError("");
    const res = await startInstance(id);
    
    if (res.success) {
      await load();
    } else {
      setError(res.error || "Failed to start instance");
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    }
    setActionLoading(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleStop(id) {
    setActionLoading(prev => ({ ...prev, [id]: "stop" }));
    setError("");
    const res = await stopInstance(id);
    
    if (res.success) {
      await load();
    } else {
      setError(res.error || "Failed to stop instance");
      if (res.error?.includes("Unauthorized")) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    }
    setActionLoading(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleLogout() {
    logout();
    if (onLogout) {
      onLogout();
    }
  }

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "2px solid #eee"
      }}>
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
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "20px", 
          backgroundColor: "#fee", 
          color: "#c33", 
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCreate}
          disabled={creating || loading}
          style={{
            padding: "12px 24px",
            backgroundColor: creating ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: creating ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          {creating ? "Creating..." : "Create New Instance"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading instances...
        </div>
      ) : instances.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "#666",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px"
        }}>
          No instances found. Create your first instance to get started.
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "20px" 
        }}>
          {instances.map(inst => (
            <div
              key={inst.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#333" }}>
                Instance {inst.id?.substring(0, 8) || "N/A"}
              </h3>
              
              <div style={{ marginBottom: "15px" }}>
                <strong>Status:</strong>{" "}
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: 
                    inst.status === "running" ? "#d4edda" :
                    inst.status === "stopped" ? "#f8d7da" :
                    "#fff3cd",
                  color:
                    inst.status === "running" ? "#155724" :
                    inst.status === "stopped" ? "#721c24" :
                    "#856404",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {inst.status || "unknown"}
                </span>
              </div>

              {inst.type && (
                <div style={{ marginBottom: "10px", color: "#666", fontSize: "14px" }}>
                  <strong>Type:</strong> {inst.type}
                </div>
              )}

              {inst.container_ip?.String && (
                <div style={{ marginBottom: "15px" }}>
                  <a
                    href={`http://${inst.container_ip.String}:8080`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  >
                    Open Workspace
                  </a>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => handleStart(inst.id)}
                  disabled={actionLoading[inst.id] === "start" || inst.status === "running"}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: 
                      inst.status === "running" ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: 
                      inst.status === "running" || actionLoading[inst.id] === "start" 
                        ? "not-allowed" 
                        : "pointer",
                    fontSize: "14px"
                  }}
                >
                  {actionLoading[inst.id] === "start" ? "Starting..." : "Start"}
                </button>

                <button
                  onClick={() => handleStop(inst.id)}
                  disabled={actionLoading[inst.id] === "stop" || inst.status === "stopped"}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: 
                      inst.status === "stopped" ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: 
                      inst.status === "stopped" || actionLoading[inst.id] === "stop" 
                        ? "not-allowed" 
                        : "pointer",
                    fontSize: "14px"
                  }}
                >
                  {actionLoading[inst.id] === "stop" ? "Stopping..." : "Stop"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
