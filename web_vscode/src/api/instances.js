const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ========================================
   LIST INSTANCES
======================================== */
export async function listInstances() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances`, { headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to fetch instances");
    return { success: true, instances: data };
  } catch (e) {
    return { success: false, error: e.message, instances: [] };
  }
}

/* ========================================
   CREATE INSTANCE (supports vscode/jupyter/mysql)
======================================== */
export async function createInstance(type, ttl_hours) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances`, {
      method: "POST",
      headers,
      body: JSON.stringify({ type, ttl_hours }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to create ${type}`);

    return { success: true, instance: data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ========================================
   START INSTANCE
======================================== */
export async function startInstance(id) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances/${id}/start`, {
      method: "POST",
      headers,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Start failed");

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ========================================
   STOP INSTANCE
======================================== */
export async function stopInstance(id) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances/${id}/stop`, {
      method: "POST",
      headers,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Stop failed");

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ========================================
   HEARTBEAT (auto-shutdown protection)
======================================== */
export async function heartbeat(id) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances/${id}/heartbeat`, {
      method: "POST",
      headers,
    });

    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

/* ========================================
   WORKSPACE URL (centralized)
======================================== */
function workspaceUrl(inst) {
  if (inst.type === "vscode")
    return `http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/vscode_backend/${inst.id}`;

  if (inst.type === "jupyter")
    return `http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/jupyter_backend/${inst.id}`;

  if (inst.type === "mysql")
    return `http://ambilio-alb-745903874.ap-southeast-2.elb.amazonaws.com/mysql_backend/${inst.id}`;
}
