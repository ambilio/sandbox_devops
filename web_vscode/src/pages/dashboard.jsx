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
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [, forceTick] = useState(0);

  /* ------------ LOAD ------------ */
  async function load() {
    setLoading(true);
    const res = await listInstances();
    if (res.success) setInstances(res.instances || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* ------------ ACTIONS ------------ */
  async function handleCreate(type) {
    setCreating(true);
    await createInstance(type, 12);
    await load();
    setCreating(false);
  }

  async function handleStart(id) {
    setActionLoading((p) => ({ ...p, [id]: "start" }));
    await startInstance(id);
    await load();
    setActionLoading((p) => ({ ...p, [id]: null }));
  }

  async function handleStop(id) {
    setActionLoading((p) => ({ ...p, [id]: "stop" }));
    await stopInstance(id);
    await load();
    setActionLoading((p) => ({ ...p, [id]: null }));
  }

  function handleLogout() {
    logout();
    onLogout?.();
  }

  /* ------------ TIMER ------------ */
  function expiresIn(inst) {
    const base = inst.last_active || inst.created_at;
    return (
      new Date(base).getTime() + inst.ttl_hours * 3600 * 1000 - Date.now()
    );
  }

  function fmt(ms) {
    if (ms <= 0) return "Expired";
    const t = Math.floor(ms / 1000);
    return `${Math.floor(t / 3600)}h ${Math.floor((t % 3600) / 60)}m ${t % 60}s`;
  }

  function workspaceUrl(inst) {
    return inst.type === "vscode"
      ? "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/vscode_backend/"
      : "http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/jupyter_backend/";
  }

  /* ------------ UI ------------ */
  return (
    <div className="app">
      <style>{css}</style>

      {/* floating ambience */}
      <div className="orb o1" />
      <div className="orb o2" />

      {/* NAVBAR */}
      <nav className="nav">
        <h2>Agentic AI Sandbox</h2>
        <div className="nav-right">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main>
        <header className="hero">
          <h1>Workspaces</h1>
          <p>Create isolated AI-ready development environments.</p>

          <div className="actions">
            <button
              disabled={creating}
              onClick={() => handleCreate("vscode")}
              className="primary"
            >
              + VS Code
            </button>
            <button
              disabled={creating}
              onClick={() => handleCreate("jupyter")}
              className="secondary"
            >
              + Jupyter
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <p className="loading">Loading workspaces…</p>
        ) : instances.length === 0 ? (
          <div className="empty">No workspaces created yet.</div>
        ) : (
          <div className="grid">
            {instances.map((inst) => {
              const remaining = expiresIn(inst);
              const expiring = remaining < 15 * 60 * 1000;
              const busy = actionLoading[inst.id];

              return (
                <div className="card" key={inst.id}>
                  <div className="card-head">
                    <h3>{inst.type === "vscode" ? "VS Code" : "Jupyter"}</h3>
                    <span
                      className={`status ${
                        inst.status === "running" ? "run" : "stop"
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>

                  {inst.status === "running" && (
                    <div
                      className={`timer ${expiring ? "pulse" : ""}`}
                    >
                      ⏳ Stops in {fmt(remaining)}
                    </div>
                  )}

                  {inst.status === "running" && (
                    <a
                      className="open"
                      href={workspaceUrl(inst)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Workspace →
                    </a>
                  )}

                  <div className="card-actions">
                    <button
                      onClick={() => handleStart(inst.id)}
                      disabled={inst.status === "running" || busy}
                    >
                      {busy === "start" ? "Starting…" : "Start"}
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleStop(inst.id)}
                      disabled={inst.status === "stopped" || busy}
                    >
                      {busy === "stop" ? "Stopping…" : "Stop"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ===================== CSS ===================== */

const css = `
.app {
  min-height:100vh;
  background:
    radial-gradient(circle at 20% 20%, rgba(108,99,255,.15), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(0,200,255,.15), transparent 40%),
    linear-gradient(180deg,#f9fbff,#eef2ff);
  font-family: Inter, system-ui, sans-serif;
}

.orb {
  position:absolute;
  width:160px;
  height:160px;
  border-radius:50%;
  filter: blur(70px);
  opacity:.25;
  animation: float 20s infinite alternate ease-in-out;
}
.o1 { background:#6c63ff; top:80px; left:60px; }
.o2 { background:#00c8ff; bottom:120px; right:80px; }

@keyframes float {
  from { transform: translateY(0); }
  to { transform: translateY(-120px); }
}

.nav {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:18px 32px;
  background:#fff;
  border-bottom:1px solid #eee;
}

.nav h2 { margin:0; }

.nav-right button {
  background:#ff4d4f;
  border:none;
  color:#fff;
  padding:8px 14px;
  border-radius:10px;
}

main {
  max-width:1200px;
  margin:0 auto;
  padding:40px 24px;
}

.hero h1 {
  font-size:42px;
  margin-bottom:6px;
}

.hero p {
  color:#666;
  margin-bottom:24px;
}

.actions {
  display:flex;
  gap:12px;
}

.primary, .secondary {
  border:none;
  padding:14px 22px;
  border-radius:14px;
  font-weight:600;
  cursor:pointer;
}
.primary {
  background:#6c63ff;
  color:#fff;
}
.secondary {
  background:#ff9800;
  color:#fff;
}

.grid {
  margin-top:40px;
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:24px;
}

.card {
  background:#fff;
  padding:22px;
  border-radius:20px;
  box-shadow:0 10px 35px rgba(0,0,0,.08);
  transition:all .3s ease;
}
.card:hover {
  transform:translateY(-6px);
  box-shadow:0 22px 55px rgba(108,99,255,.28);
}

.card-head {
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.status {
  padding:4px 12px;
  font-size:12px;
  font-weight:600;
  border-radius:20px;
}
.run {
  background:#e6fffb;
  color:#08979c;
}
.stop {
  background:#fff1f0;
  color:#cf1322;
}

.timer {
  margin-top:8px;
  font-size:13px;
  color:#555;
}
.pulse {
  animation:pulse 1.2s infinite;
}
@keyframes pulse {
  0%{opacity:1}
  50%{opacity:.55}
  100%{opacity:1}
}

.open {
  display:inline-block;
  margin-top:12px;
  color:#6c63ff;
  font-weight:600;
  text-decoration:none;
}

.card-actions {
  display:flex;
  gap:10px;
  margin-top:16px;
}
.card-actions button {
  flex:1;
  padding:10px;
  border-radius:10px;
  border:none;
  background:#f0f0f0;
}
.card-actions .danger {
  background:#ff4d4f;
  color:#fff;
}

.loading, .empty {
  margin-top:40px;
  text-align:center;
  color:#666;
}
`;
