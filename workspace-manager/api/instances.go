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


func (h *InstanceHandler) CreateInstance(c *gin.Context) {
	var req struct {
		Type     string `json:"type"`
		TTLHours int32  `json:"ttl_hours"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
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

	if req.Type == "aws" {
		awsSvc, err := docker.NewAWSService()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		username, password, consoleURL, err :=
			awsSvc.CreateSandboxUser(c.Request.Context(), instanceID.String())
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		inst, err := h.q.CreateInstance(c, db.CreateInstanceParams{
			ID:       instanceID,
			UserID:   userUUID,
			Type:     "aws",
			EfsPath:  dataPath,
			TtlHours: req.TTLHours,

			ConsoleUrl: sql.NullString{String: consoleURL, Valid: true},
			AwsUsername: sql.NullString{String: username, Valid: true},
			AwsPassword: sql.NullString{String: password, Valid: true},
		})
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(201, inst)
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

	c.JSON(201, inst)
}


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

	if inst.Type == "aws" {
		c.JSON(400, gin.H{"error": "aws instances do not start"})
		return
	}

	if inst.Status == "running" {
		c.JSON(200, inst)
		return
	}

	result, err := h.docker.Run(
		c.Request.Context(),
		inst.ID.String(),
		inst.Type,
		inst.EfsPath,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	port, err := strconv.Atoi(result.HostPort)
	if err != nil {
		c.JSON(500, gin.H{"error": "invalid host port"})
		return
	}

	inst, err = h.q.UpdateInstanceOnStart(c, db.UpdateInstanceOnStartParams{
		ID: inst.ID,
		ContainerID: sql.NullString{
			String: result.ContainerID,
			Valid:  true,
		},
		HostPort: sql.NullInt32{
			Int32: int32(port),
			Valid: true,
		},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, inst)
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

	if inst.Type == "aws" {
		c.JSON(400, gin.H{"error": "aws instances cannot be stopped"})
		return
	}

	h.docker.Stop(inst.ID.String(), inst.Type)

	inst, _ = h.q.UpdateInstanceStatus(c, db.UpdateInstanceStatusParams{
		ID:     inst.ID,
		Status: "stopped",
	})

	c.JSON(200, inst)
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
