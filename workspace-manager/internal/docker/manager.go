package docker

import (
	"context"
	"fmt"
	"os/exec"
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
) (containerID string, err error) {

	image := map[string]string{
		"vscode":  "vscode_embed:latest",
		"jupyter": "jupyter_embed:latest",
		"mysql":   "mysql_embed:latest",
	}[workspaceType]

	if image == "" {
		return "", fmt.Errorf("unknown workspace type")
	}

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d",
		"--name", "ws_"+instanceID,
		"-v", dataPath+":/data",
		image,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("docker run failed: %s", string(out))
	}

	return string(out), nil
}

func (d *DockerManager) StopContainer(containerID string) error {
	cmd := exec.Command("docker", "rm", "-f", containerID)
	_, err := cmd.CombinedOutput()
	return err
}
