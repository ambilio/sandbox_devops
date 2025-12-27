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

func (d *DockerManager) RunContainer(
	ctx context.Context,
	instanceID string,
	workspaceType string,
	dataPath string,
) (containerID string, hostPort string, err error) {

	image := map[string]string{
		"vscode":  "vscode_embedding:latest",
		"jupyter": "jupyter_embedding:latest",
		"mysql":   "mysql_embedding:latest",
	}[workspaceType]

	port := map[string]string{
		"vscode":  "8443",
		"jupyter": "8888",
		"mysql":   "3306",
	}[workspaceType]

	if image == "" || port == "" {
		return "", "", fmt.Errorf("unknown workspace type: %s", workspaceType)
	}

	containerName := "ws_" + instanceID

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d",
		"--name", containerName,
		"-p", "0:"+port,
		"--restart", "unless-stopped",
		"-v", dataPath+":/data",
		image,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", "", fmt.Errorf("docker run failed: %s", string(out))
	}

	containerID = strings.TrimSpace(string(out))

	portCmd := exec.Command(
		"docker", "port", containerName, port,
	)
	portOut, err := portCmd.CombinedOutput()
	if err != nil {
		return "", "", fmt.Errorf("docker port lookup failed: %s", string(portOut))
	}

	// example output: 0.0.0.0:49123
	parts := strings.Split(strings.TrimSpace(string(portOut)), ":")
	if len(parts) != 2 {
		return "", "", fmt.Errorf("unexpected docker port output: %s", portOut)
	}

	hostPort = parts[1]
	return containerID, hostPort, nil
}

func (d *DockerManager) StopContainer(containerName string) error {
	cmd := exec.Command("docker", "rm", "-f", containerName)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("docker stop failed: %s", string(out))
	}
	return nil
}
