import { useState } from "react";
import { login } from "../api/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const res = await login(email, password);
    if (res.token) {
      localStorage.setItem("token", res.token);
      onLogin();
    } else {
      alert(res.error);
    }
  }

  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password" />
      <button onClick={submit}>Login</button>
    </div>
  );
}
