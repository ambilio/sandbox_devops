package api

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/gin-gonic/gin"

	db "example.com/m/v2/db/sqlc"
	ecsmanager "example.com/m/v2/ecs"
)

type InstanceHandler struct {
	q   *db.Queries
	ecs *ecsmanager.ECSManager
}

func NewInstanceHandler(q *db.Queries, ecsM *ecsmanager.ECSManager) *InstanceHandler {
	return &InstanceHandler{q: q, ecs: ecsM}
}


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

	userIDStr := c.GetString("userID")
	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	instanceID := uuid.New()

	efsPath := "/efs/users/" + userUUID.String() + "/" + instanceID.String()

	inst, err := h.q.CreateInstance(c, db.CreateInstanceParams{
		ID:       instanceID,
		UserID:   userUUID,
		Type:     req.Type,
		EfsPath:  efsPath,
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


func (h *InstanceHandler) StartInstance(c *gin.Context) {
	id := c.Param("id")

	instanceID, err := uuid.Parse(id)
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
		c.JSON(200, gin.H{
			"message": "already running",
		})
		return
	}

	taskArn, ip, err := h.ecs.RunWorkspaceTask(
		c.Request.Context(),
		inst.UserID.String(),
		inst.ID.String(),
		inst.EfsPath,
		inst.Type,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	_, err = h.q.UpdateInstanceOnStart(c, db.UpdateInstanceOnStartParams{
		ID:          inst.ID,
		TaskArn:     sql.NullString{String: taskArn, Valid: true},
		ContainerIp: sql.NullString{String: ip, Valid: true},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"id":     inst.ID,
		"type":   inst.Type,
		"status": "running",
	})
}


func (h *InstanceHandler) StopInstance(c *gin.Context) {
	id := c.Param("id")

	instanceID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid instance id"})
		return
	}

	inst, err := h.q.GetInstanceByID(c, instanceID)
	if err != nil {
		c.JSON(404, gin.H{"error": "instance not found"})
		return
	}

	if !inst.TaskArn.Valid {
		c.JSON(400, gin.H{"error": "instance not running"})
		return
	}

	_ = h.ecs.StopTask(c.Request.Context(), inst.TaskArn.String)

	_, _ = h.q.UpdateInstanceStatus(c, db.UpdateInstanceStatusParams{
		ID:     inst.ID,
		Status: "stopped",
	})

	c.JSON(200, gin.H{"message": "stopped"})
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
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, instances)
}


func (h *InstanceHandler) Heartbeat(c *gin.Context) {
	id := c.Param("id")

	instanceID, err := uuid.Parse(id)
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
