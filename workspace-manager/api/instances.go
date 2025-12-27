package api

import (
	"database/sql"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	db "example.com/m/v2/db/sqlc"
	"example.com/m/v2/internal/docker"
)

type InstanceHandler struct {
	q      *db.Queries
	docker *docker.DockerManager
}

func NewInstanceHandler(q *db.Queries) *InstanceHandler {
	return &InstanceHandler{
		q:      q,
		docker: docker.NewDockerManager(),
	}
}

/* ========================= CREATE ========================= */

func (h *InstanceHandler) CreateInstance(c *gin.Context) {
	var req struct {
		Type     string `json:"type"`
		TTLHours int32  `json:"ttl_hours"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if req.Type != "vscode" && req.Type != "jupyter" && req.Type != "mysql" {
		c.JSON(400, gin.H{"error": "invalid workspace type"})
		return
	}

	userUUID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	instanceID := uuid.New()

	dataPath := filepath.Join(
		"/var/lib/ambilio",
		userUUID.String(),
		instanceID.String(),
	)

	if err := os.MkdirAll(dataPath, 0755); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	inst, err := h.q.CreateInstance(c, db.CreateInstanceParams{
		ID:       instanceID,
		UserID:   userUUID,
		Type:     req.Type,
		EfsPath:  dataPath,
		TtlHours: req.TTLHours,
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{
		"id":     inst.ID,
		"type":   inst.Type,
		"status": "stopped",
	})
}

/* ========================= START ========================= */

func (h *InstanceHandler) StartInstance(c *gin.Context) {
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	inst, err := h.q.GetInstanceByID(c, instanceID)
	if err != nil {
		c.JSON(404, gin.H{"error": "instance not found"})
		return
	}

	if inst.Status == "running" {
		c.JSON(200, gin.H{"message": "already running"})
		return
	}

	containerID, hostPort, err := h.docker.RunContainer(
		c.Request.Context(),
		inst.ID.String(),
		inst.Type,
		inst.EfsPath,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	p, _ := strconv.Atoi(hostPort)

	_, err = h.q.UpdateInstanceOnStart(c, db.UpdateInstanceOnStartParams{
	ID: inst.ID,
	ContainerID: sql.NullString{
		String: containerID,
		Valid:  true,
	},
	
	HostPort: sql.NullInt32{
		Int32: int32(p),
		Valid: true,
	},
})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"id":     inst.ID,
		"type":   inst.Type,
		"status": "running",
		"port":   hostPort,
	})
}


func (h *InstanceHandler) StopInstance(c *gin.Context) {
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	inst, err := h.q.GetInstanceByID(c, instanceID)
	if err != nil {
		c.JSON(404, gin.H{"error": "instance not found"})
		return
	}

	containerName := "ws_" + inst.ID.String()

	_ = h.docker.StopContainer(containerName)

	_, _ = h.q.UpdateInstanceStatus(c, db.UpdateInstanceStatusParams{
		ID:     inst.ID,
		Status: "stopped",
	})

	c.JSON(200, gin.H{"message": "stopped"})
}


func (h *InstanceHandler) ListInstances(c *gin.Context) {
	userUUID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	instances, err := h.q.ListUserInstances(c, userUUID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, instances)
}


func (h *InstanceHandler) Heartbeat(c *gin.Context) {
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	_, _ = h.q.UpdateLastActive(c, db.UpdateLastActiveParams{
		ID:         instanceID,
		LastActive: time.Now(),
	})

	c.JSON(200, gin.H{"ok": true})
}
