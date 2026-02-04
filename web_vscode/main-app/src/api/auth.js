const BASE = import.meta.env.VITE_API_URL || "http://3.208.28.22:8080/app";

export async function signup(email, password) {
  try {
    const res = await fetch(`${BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.error || "Signup failed", success: false };
    }
    
    return { success: true, message: data.message || "Signup successful" };
  } catch (error) {
    return { error: error.message || "Network error", success: false };
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.error || "Login failed", success: false };
    }
    
    // Store JWT token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
      return { success: true, token: data.token };
    }
    
    return { error: "No token received", success: false };
  } catch (error) {
    return { error: error.message || "Network error", success: false };
  }
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
