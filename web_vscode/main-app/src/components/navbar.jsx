export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">🧠 Agentic Sandbox</div>
        <a className="nav-link active">Home</a>
        <a className="nav-link">Workspaces</a>
        <a className="nav-link dim">Activity</a>
      </div>

      <div className="nav-right">
        <span className="pill">Guide Mode ON</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
