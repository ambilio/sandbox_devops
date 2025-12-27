export function CreateWorkspaceBar({
  onCreateVS,
  onCreateJupyter,
  onCreateMySQL,
  creating,
}) {
  return (
    <div className="create-bar">
      <button disabled={creating} onClick={onCreateVS}>
        ➕ VS Code Workspace
      </button>

      <button
        disabled={creating}
        onClick={onCreateJupyter}
        className="secondary"
      >
        ➕ Jupyter Notebook
      </button>

      <button
        disabled={creating}
        onClick={onCreateMySQL}
        className="secondary"
      >
        ➕ MySQL IDE
      </button>
    </div>
  );
}
