const BASE = import.meta.env.VITE_API_URL;

export async function listInstances(token) {
  const res = await fetch(`${BASE}/instances`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createInstance(token, type, ttl_hours) {
  const res = await fetch(`${BASE}/instances`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, ttl_hours }),
  });
  return res.json();
}

export async function startInstance(token, id) {
  const res = await fetch(`${BASE}/instances/${id}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function stopInstance(token, id) {
  const res = await fetch(`${BASE}/instances/${id}/stop`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
