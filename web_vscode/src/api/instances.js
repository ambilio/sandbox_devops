const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listInstances() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances`, { headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to fetch");

    return { success: true, instances: data };
  } catch (e) {
    return { success: false, error: e.message, instances: [] };
  }
}

export async function createInstance(type, ttl_hours) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/instances`, {
      method: "POST",
      headers,
      body: JSON.stringify({ type, ttl_hours }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Create failed");

    return { success: true, instance: data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

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
