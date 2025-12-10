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
  const [actionLoading, setActionLoading] = useState({}); // id -> "start" | "stop"

  async function load() {
    setLoading(true);
    setError("");

    const res = await listInstances();
    if (res.success) {
      setInstances(res.instances || []);
    } else {
      setError(res.error || "Failed to load instances");
      if (res.error?.includes("Unauthorized")) handleLogout();
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(type) {
    setCreating(true);
    setError("");

    const res = await createInstance(type, 12); // 12h TTL
    if (res.success) {
      await load();
    } else {
      setError(res.error || `Failed to create ${type}`);
    }

    setCreating(false);
  }

  async function handleStart(id) {
    setActionLoading((p) => ({ ...p, [id]: "start" }));
    setError("");

    const res = await startInstance(id);
    if (res.success) await load();
    else setError(res.error);

    setActionLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  async function handleStop(id) {
    setActionLoading((p) => ({ ...p, [id]: "stop" }));
    setError("");

    const res = await stopInstance(id);
    if (res.success) await load();
    else setError(res.error);

    setActionLoading((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  function handleLogout() {
    logout();
    onLogout?.();
  }

  function workspaceUrl(inst) {
  return inst.type === "vscode"
    ? "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/vscode_backend/"
    : "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/jupyter_backend/";
}

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Workspace Dashboard</h1>
        <button onClick={handleLogout} style={{ background: "#dc3545", color: "#fff" }}>
          Logout
        </button>
      </header>

      {error && <div style={{ color: "red", margin: "20px 0" }}>{error}</div>}

      {/* CREATE */}
      <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
        <button disabled={creating} onClick={() => handleCreate("vscode")}>
          ➕ Create VS Code
        </button>
        <button disabled={creating} onClick={() => handleCreate("jupyter")}>
          ➕ Create Jupyter
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : instances.length === 0 ? (
        <p>No instances yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 20 }}>
          {instances.map((inst) => {
            const busy = actionLoading[inst.id];

            return (
              <div key={inst.id} style={{ border: "1px solid #ccc", padding: 20 }}>
                <h3>
                  {inst.type === "vscode" ? "VS Code" : "Jupyter"} —{" "}
                  {inst.id.slice(0, 8)}
                </h3>

                <p>Status: <b>{inst.status}</b></p>

                {inst.status === "running" && (
                  <a href={workspaceUrl(inst)} target="_blank" rel="noreferrer">
                    Open Workspace
                  </a>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => handleStart(inst.id)}
                    disabled={inst.status === "running" || busy === "start"}
                  >
                    {busy === "start" ? "Starting..." : "Start"}
                  </button>

                  <button
                    onClick={() => handleStop(inst.id)}
                    disabled={inst.status === "stopped" || busy === "stop"}
                  >
                    {busy === "stop" ? "Stopping..." : "Stop"}
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
