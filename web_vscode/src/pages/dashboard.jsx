import { useEffect, useState } from "react";
import { listInstances, createInstance, startInstance, stopInstance } from "../api/instances";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [instances, setInstances] = useState([]);

  async function load() {
    const res = await listInstances(token);
    setInstances(res);
  }

  useEffect(() => {
    load();
  }, []);

  async function createNew() {
    const res = await createInstance(token, "workspace", 12);
    load();
  }

  return (
    <div>
      <button onClick={createNew}>Create Instance</button>

      {instances.map(inst => (
        <div key={inst.id}>
          <p>{inst.id}</p>
          <p>Status: {inst.status}</p>

          <button onClick={() => startInstance(token, inst.id)}>
            Start
          </button>

          <button onClick={() => stopInstance(token, inst.id)}>
            Stop
          </button>

          {inst.container_ip?.String && (
            <a
              href={`http://${inst.container_ip.String}:8080`}
              target="_blank"
              rel="noreferrer"
            >
              Open Workspace
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
