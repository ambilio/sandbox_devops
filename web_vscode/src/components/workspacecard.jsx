export default function WorkspaceCard({
  inst,
  onStart,
  onStop,
  openUrl,
  remaining,
  loading
}) {
  const running = inst.status === "running";

  return (
    <div className="workspace-card">
      <div className="card-header">
        <h3>{inst.type === "vscode" ? "VS Code Workspace" : "Jupyter Notebook"}</h3>
        <span className={`status ${inst.status}`}>{inst.status}</span>
      </div>

      {running && (
        <div className="timer">
          ⏱ Auto-stops in <b>{remaining}</b>
        </div>
      )}

      <div className="card-actions">
        {running && (
          <a href={openUrl} target="_blank" rel="noreferrer" className="primary">
            Open Workspace
          </a>
        )}

        {!running ? (
          <button onClick={onStart} disabled={loading}>Start</button>
        ) : (
          <button onClick={onStop} disabled={loading} className="danger">
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
