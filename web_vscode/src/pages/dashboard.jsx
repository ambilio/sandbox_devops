import { useEffect, useState } from "react";
import {
  listInstances,
  createInstance,
  startInstance,
  stopInstance,
} from "../api/instances";
import { logout } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ onLogout }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [view, setView] = useState("all"); // all | my

  /* ------------ LOAD ------------ */
  async function load() {
    setLoading(true);
    const res = await listInstances();
    if (res.success) setInstances(res.instances || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
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

 const navigate = useNavigate();

function handleLogout() {
  logout();
  navigate("/login", { replace: true });
}

  /* ------------ HELPERS ------------ */
  function expiresIn(inst) {
    const base = inst.last_active || inst.created_at;
    return new Date(base).getTime() + inst.ttl_hours * 3600 * 1000 - Date.now();
  }

  function fmt(ms) {
    if (ms <= 0) return "Expired";
    const t = Math.floor(ms / 1000);
    return `${Math.floor(t / 3600)}h ${Math.floor((t % 3600) / 60)}m ${t % 60}s`;
  }

  const API_HOST =
    import.meta.env.VITE_WORKSPACE_HOST || "3.208.28.22";

  function getHostPort(inst) {
    if (!inst?.host_port?.Valid) return null;
    return inst.host_port.Int32;
  }

  function workspaceUrl(inst) {
    const port = getHostPort(inst);
    if (!port || inst.status !== "running") return null;
    return `http://${API_HOST}:${port}`;
  }

  const visibleInstances =
    view === "my"
      ? instances.filter((i) => i.status === "running")
      : instances;

  /* ------------ UI ------------ */
  return (
    <div className="app">
      <style>{css}</style>

      <div className="orb o1" />
      <div className="orb o2" />

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

          {/* ===== CREATE BUTTONS (UNCHANGED) ===== */}
          <div className="actions">
            <div className="create-btn vscode" onClick={() => handleCreate("vscode")}>
              <div className="icon">{"</>"}</div>
              <span>Create VS Code</span>
            </div>

            <div className="create-btn jupyter" onClick={() => handleCreate("jupyter")}>
              <div className="icon">📓</div>
              <span>Create Jupyter</span>
            </div>

            <div className="create-btn mysql" onClick={() => handleCreate("mysql")}>
              <div className="icon">🛢️</div>
              <span>Create MySQL Shell</span>
            </div>

            <div className="create-btn langflow" onClick={() => handleCreate("langflow")}>
              <div className="icon">🧠</div>
              <span>Create Langflow</span>
            </div>

            <div className="create-btn weaviate" onClick={() => handleCreate("weaviate")}>
              <div className="icon">🧬</div>
              <span>Create Weaviate</span>
            </div>
          </div>
        </header>

        {/* ===== INSTANCE SWITCH (NEW, CLEAN) ===== */}
        <div className="instance-switch">
          <button
            className={view === "all" ? "active" : ""}
            onClick={() => setView("all")}
          >
            All Instances
          </button>
          <button
            className={view === "my" ? "active" : ""}
            onClick={() => setView("my")}
          >
            My Instances
          </button>
        </div>

        {/* ===== INSTANCE GRID (ORIGINAL TILE STYLE) ===== */}
        {loading ? (
          <p className="loading">Loading workspaces…</p>
        ) : visibleInstances.length === 0 ? (
          <div className="empty">
            {view === "my"
              ? "No running instances"
              : "No workspaces created yet"}
          </div>
        ) : (
          <div className="grid">
            {visibleInstances.map((inst) => {
              const busy = actionLoading[inst.id];
              return (
                <div className="card" key={inst.id}>
                  <div className="card-head">
                    <h3>
                      {{
                        vscode: "VS Code",
                        jupyter: "Jupyter",
                        mysql: "MySQL",
                        langflow: "Langflow",
                        weaviate: "Weaviate",
                      }[inst.type]}
                    </h3>
                    <span
                      className={`status ${
                        inst.status === "running" ? "run" : "stop"
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>

                  {inst.status === "running" && (
                    <div className="timer">
                      ⏳ Stops in {fmt(expiresIn(inst))}
                    </div>
                  )}

                  {inst.status === "running" && workspaceUrl(inst) && (
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
                      Start
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleStop(inst.id)}
                      disabled={inst.status === "stopped" || busy}
                    >
                      Stop
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


const css = `
.instance-switch {
  display: flex;
  gap: 6px;
  background: #e5e7eb;
  padding: 6px;
  border-radius: 999px;
  width: fit-content;
  margin: 40px auto 24px;
}

.instance-switch button {
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
}

.instance-switch button.active {
  background: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
}
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
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
/* ================= BUTTON CONTAINERS ================= */

.actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.create-btn {
  position: relative;
  overflow: hidden;
  min-width: 200px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  transform: translateY(0);
  transition: all 0.3s ease;
}

/* VS CODE */
.create-btn.vscode {
  background: linear-gradient(135deg, #007acc, #005a9e);
}

/* JUPYTER */
.create-btn.jupyter {
  background: linear-gradient(135deg, #f37726, #d45b13);
}

/* hover lift */
.create-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.25);
}

/* ================= ICON POP ================= */

.create-btn .icon {
  position: absolute;
  font-size: 26px;
  opacity: 0.15;
  transform: scale(1);
  transition: all 0.4s ease;
}

/* floating animation */
.create-btn:hover .icon {
  opacity: 0.35;
  transform: translateY(-14px) scale(1.5);
}

/* Click pop */
.create-btn:active .icon {
  transform: translateY(-20px) scale(1.8);
}

/* text layering */
.create-btn span {
  z-index: 2;
  font-size: 15px;
}

/* ================= LIGHT RIPPLE ================= */
.create-btn::after {
  content: "";
  position: absolute;
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle,
    rgba(255,255,255,.35),
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.create-btn:hover::after {
  opacity: 1;
}
.create-btn.mysql {
  background: linear-gradient(135deg, #00758f, #005f73);
}

/* MySQL icon floating animation */
.mysql-icon {
  color: white;
}
/* LANGFLOW */
.create-btn.langflow {
  background: linear-gradient(135deg, #6a00ff, #9b5cff);
}
.create-btn.weaviate {
  background: linear-gradient(135deg, #ff6a00, #ff9f45);
}

/* ================= MY INSTANCES DROPDOWN ================= */

.my-instances-toggle {
  margin-top: 32px;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: white;
  padding: 14px 20px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  user-select: none;
}

.my-instances-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.my-instances-toggle .chevron {
  transition: transform 0.3s ease;
}

.my-instances-toggle.open .chevron {
  transform: rotate(180deg);
}

/* PANEL */

.my-instances-panel {
  overflow: hidden;
  transition:
    max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    transform 0.3s ease;
}

.my-instances-panel.collapsed {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
}

.my-instances-panel.expanded {
  max-height: 2000px; /* large enough */
  opacity: 1;
  transform: translateY(0);
  margin-top: 24px;
}
.type-pill {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-weight: 600;
}
.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.column {
  background: rgba(255,255,255,0.75);
  border-radius: 18px;
  padding: 14px;
  backdrop-filter: blur(10px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
}

.col-title {
  font-size: 15px;
}

.col-meta {
  font-size: 12px;
  color: #666;
}

.column-body {
  max-height: 0;
  overflow: hidden;
  transition: all 0.45s ease;
  opacity: 0;
}

.column-body.open {
  max-height: 1000px;
  opacity: 1;
  margin-top: 12px;
}
/* ===== ALL INSTANCES LAYOUT ===== */

.all-instances {
  margin-top: 60px;
}

/* ONE ROW PER TYPE */
.type-row {
  margin-bottom: 42px;
}

/* CENTERED TYPE BUTTON */
.type-toggle {
  margin: 0 auto 18px;
  max-width: 420px;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: white;
  padding: 16px 24px;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: all 0.35s ease;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

.type-toggle:hover {
  transform: translateY(-3px) scale(1.02);
}

.type-toggle.open {
  background: linear-gradient(135deg, #6c63ff, #4f46e5);
}

/* ICON */
.type-icon {
  font-size: 20px;
}

/* SLIDER CONTAINER */
.type-slider {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-12px);
  transition:
    max-height 0.6s ease,
    opacity 0.4s ease,
    transform 0.4s ease;
}

.type-slider.show {
  max-height: 420px;
  opacity: 1;
  transform: translateY(0);
}

/* HORIZONTAL SCROLL */
.horizontal-scroll {
  display: flex;
  gap: 18px;
  padding: 18px 10px 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
}

/* HIDE SCROLLBAR (CLEAN) */
.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}
.horizontal-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.25);
  border-radius: 6px;
}

/* MINI CARD TWEAK FOR HORIZONTAL */
.card.mini {
  min-width: 260px;
  flex-shrink: 0;
}
/* ===== SLIDER WITH BUTTONS ===== */

.slider-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.slider-btn:hover {
  transform: scale(1.12);
  background: linear-gradient(135deg, #6c63ff, #4f46e5);
}

.horizontal-scroll {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 6px;
}

/* hide ugly scrollbar */
.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

`;

