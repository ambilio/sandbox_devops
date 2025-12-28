package docker

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
)

type DockerManager struct{}

func NewDockerManager() *DockerManager {
	return &DockerManager{}
}

type RunResult struct {
	ContainerID string
	HostPort    string
}

func (d *DockerManager) Run(
	ctx context.Context,
	instanceID string,
	workspaceType string,
	dataPath string,
) (*RunResult, error) {

	switch workspaceType {

	case "vscode":
		return d.runSingle(ctx, instanceID, "vscode_embedding:latest", "8443", dataPath)

	case "jupyter":
		return d.runSingle(ctx, instanceID, "jupyter_embedding:latest", "8888", dataPath)

	case "langflow":
		return d.runSingle(ctx, instanceID, "langflowai/langflow:latest", "7860", dataPath)

	case "mysql":
		return d.runMySQL(ctx, instanceID, dataPath)

	default:
		return nil, fmt.Errorf("unknown workspace type: %s", workspaceType)
	}
}

/* ---------- Generic Web Workspace ---------- */

func (d *DockerManager) runSingle(
	ctx context.Context,
	instanceID, image, port, dataPath string,
) (*RunResult, error) {

	name := "ws_" + instanceID

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d",
		"--name", name,
		"-p", "0:"+port,
		"--restart", "unless-stopped",
		"-v", dataPath+":/data",
		image,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("docker run failed: %s", out)
	}

	hostPort, err := d.lookupPort(name, port)
	if err != nil {
		return nil, err
	}

	return &RunResult{
		ContainerID: strings.TrimSpace(string(out)),
		HostPort:    hostPort,
	}, nil
}

/* ---------- MySQL + Adminer ---------- */

func (d *DockerManager) runMySQL(
	ctx context.Context,
	instanceID string,
	dataPath string,
) (*RunResult, error) {

	mysqlName := "ws_mysql_" + instanceID
	adminerName := "ws_mysql_adminer_" + instanceID

	// MySQL (persistent)
	mysqlCmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d",
		"--name", mysqlName,
		"--network", "ambilio_net",
		"--restart", "unless-stopped",
		"-e", "MYSQL_ROOT_PASSWORD=root",
		"-e", "MYSQL_DATABASE=workspace",
		"-v", dataPath+"/mysql:/var/lib/mysql",
		"mysql:8.0",
	)

	if out, err := mysqlCmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("mysql run failed: %s", out)
	}

	// Adminer UI
	adminerCmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d",
		"--name", adminerName,
		"--network", "ambilio_net",
		"-p", "0:8080",
		"--restart", "unless-stopped",
		"adminer",
	)

	if out, err := adminerCmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("adminer run failed: %s", out)
	}

	hostPort, err := d.lookupPort(adminerName, "8080")
	if err != nil {
		return nil, err
	}

	return &RunResult{
		ContainerID: mysqlName,
		HostPort:    hostPort,
	}, nil
}

/* ---------- Utils ---------- */

func (d *DockerManager) lookupPort(container, port string) (string, error) {
	cmd := exec.Command("docker", "port", container, port)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("port lookup failed: %s", out)
	}

	parts := strings.Split(strings.TrimSpace(string(out)), ":")
	return parts[len(parts)-1], nil
}

func (d *DockerManager) Stop(instanceID, workspaceType string) {
	exec.Command("docker", "rm", "-f", "ws_"+instanceID).Run()
	exec.Command("docker", "rm", "-f", "ws_mysql_"+instanceID).Run()
	exec.Command("docker", "rm", "-f", "ws_mysql_adminer_"+instanceID).Run()
}
