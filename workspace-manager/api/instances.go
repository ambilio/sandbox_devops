package api

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/google/uuid"

	db "example.com/m/v2/db/sqlc"
	"example.com/m/v2/ecs"
	"github.com/gin-gonic/gin"
)

type InstanceHandler struct {
	q    *db.Queries
	ecs  *ecsmanager.ECSManager
}

func NewInstanceHandler(q *db.Queries, ecsM *ecsmanager.ECSManager) *InstanceHandler {
	return &InstanceHandler{q, ecsM}
}

// POST /instances
func (h *InstanceHandler) CreateInstance(c *gin.Context) {
	var req struct {
		Type     string `json:"type"`
		TTLHours int32  `json:"ttl_hours"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// userID stored in JWT middleware as string
	userIDStr := c.GetString("userID")
	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid userID"})
		return
	}

	// generate instance UUID correctly
	instanceUUID := uuid.New()

	efsPath := "/efs/users/" + userUUID.String() + "/" + instanceUUID.String()

	inst, err := h.q.CreateInstance(c, db.CreateInstanceParams{
		ID:       instanceUUID,
		UserID:   userUUID,
		Type:     req.Type,
		EfsPath:  efsPath,
		TtlHours: req.TTLHours,
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	taskArn, privateIP, err := h.ecs.RunWorkspaceTask(
		c,
		userUUID.String(),
		inst.ID.String(),
		efsPath,
		req.Type,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	_, _ = h.q.UpdateInstanceOnStart(c, db.UpdateInstanceOnStartParams{
		ID:          inst.ID,
		TaskArn:     sql.NullString{String: taskArn, Valid: true},
    ContainerIp: sql.NullString{String: privateIP, Valid: true},
	})

	c.JSON(200, gin.H{
		"instance_id": inst.ID,
		"url":         "/workspaces/" + inst.ID.String(),
	})
}


// POST /instances/:id/stop
// POST /instances/:id/stop
func (h *InstanceHandler) StopInstance(c *gin.Context) {
	id := c.Param("id")

	instanceUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	inst, err := h.q.GetInstanceByID(c, instanceUUID)
	if err != nil {
		c.JSON(404, gin.H{"error": "instance not found"})
		return
	}

	// Check if TaskArn is valid before stopping
if inst.TaskArn.Valid {
    _ = h.ecs.StopTask(c, inst.TaskArn.String)
} else {
    // Handle the case where TaskArn is NULL
    c.JSON(400, gin.H{"error": "task ARN not available for this instance"})
    return
}


	_, _ = h.q.UpdateInstanceStatus(c, db.UpdateInstanceStatusParams{
		ID:     instanceUUID,
		Status: "stopped",
	})

	c.JSON(200, gin.H{"message": "stopped"})
}


// POST /instances/:id/heartbeat
// POST /instances/:id/heartbeat
func (h *InstanceHandler) Heartbeat(c *gin.Context) {
	id := c.Param("id")

	instanceUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	_, err = h.q.UpdateLastActive(c, db.UpdateLastActiveParams{
		ID:         instanceUUID,
		LastActive: time.Now(),
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"ok": true})
}

func (h *InstanceHandler) ListInstances(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	instances, err := h.q.ListUserInstances(c, userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, instances)
}

// POST /instances/:id/start
func (h *InstanceHandler) StartInstance(c *gin.Context) {
	id := c.Param("id")

	instanceUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	inst, err := h.q.GetInstanceByID(c, instanceUUID)
	if err != nil {
		c.JSON(404, gin.H{"error": "instance not found"})
		return
	}

	// If already running, return existing URL
	if inst.Status == "running" && inst.ContainerIp.String != "" {
		c.JSON(200, gin.H{
			"instance_id": inst.ID,
			"url":         "/workspaces/" + inst.ID.String(),
		})
		return
	}

	// Restart ECS task
	taskArn, privateIP, err := h.ecs.RunWorkspaceTask(
		c,
		inst.UserID.String(),
		inst.ID.String(),
		inst.EfsPath,
		inst.Type,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Update DB
	_, err = h.q.UpdateInstanceOnStart(c, db.UpdateInstanceOnStartParams{
		ID:          inst.ID,
		TaskArn:     sql.NullString{String: taskArn, Valid: true},
    ContainerIp: sql.NullString{String: privateIP, Valid: true},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"instance_id": inst.ID,
		"url":         "/workspaces/" + inst.ID.String(),
	})
}
