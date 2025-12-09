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
	ecs   *ecsmanager.ECSManager
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

	efsPath := "/efs/users/" + userUUID.String() + "/" + instanceUUID.String() + "/" + req.Type


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
func (h *InstanceHandler) StopInstance(c *gin.Context) {
    id := c.Param("id")
    workspaceType := c.Query("type")

    instanceUUID, _ := uuid.Parse(id)
    inst, _ := h.q.GetInstanceByID(c, instanceUUID)

    var taskArn string

    if workspaceType == "vscode" {
        if inst.VscodeTaskArn.Valid {
            taskArn = inst.VscodeTaskArn.String
        }
    } else if workspaceType == "jupyter" {
        if inst.JupyterTaskArn.Valid {
            taskArn = inst.JupyterTaskArn.String
        }
    }

    if taskArn == "" {
        c.JSON(400, gin.H{"error": "task not running"})
        return
    }

    _ = h.ecs.StopTask(c, taskArn)

    if workspaceType == "vscode" {
        h.q.ClearVSCodeData(c, instanceUUID)
    } else {
        h.q.ClearJupyterData(c, instanceUUID)
    }

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

func (h *InstanceHandler) StartInstance(c *gin.Context) {
    id := c.Param("id")
    workspaceType := c.Query("type") // vscode / jupyter

    if workspaceType != "vscode" && workspaceType != "jupyter" {
        c.JSON(400, gin.H{"error": "invalid type"})
        return
    }

    instanceUUID, _ := uuid.Parse(id)
    inst, err := h.q.GetInstanceByID(c, instanceUUID)
    if err != nil {
        c.JSON(404, gin.H{"error": "instance not found"})
        return
    }

    var existingIP string
    if workspaceType == "vscode" {
        existingIP = inst.VscodeIp.String
    } else {
        existingIP = inst.JupyterIp.String
    }

    if existingIP != "" {
        c.JSON(200, gin.H{
            "url": "/workspaces/" + inst.ID.String() + "?type=" + workspaceType,
        })
        return
    }

    // Launch isolated task
    efsPath := inst.EfsPath + "/" + workspaceType

    _, _, err = h.ecs.RunWorkspaceTask(
        c,
        inst.UserID.String(),
        inst.ID.String(),
        efsPath,
        workspaceType,
    )

}

func (h *InstanceHandler) startWorkspace(c *gin.Context, workspaceType string) {
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

	var existingIP sql.NullString
	if workspaceType == "vscode" {
		existingIP = inst.VscodeIp
	} else {
		existingIP = inst.JupyterIp
	}

	if existingIP.Valid {
		c.JSON(200, gin.H{
			"url": "/workspaces/" + inst.ID.String() + "?type=" + workspaceType,
		})
		return
	}

	efsPath := inst.EfsPath + "/" + workspaceType

	taskArn, ip, err := h.ecs.RunWorkspaceTask(
		c.Request.Context(),
		inst.UserID.String(),
		inst.ID.String(),
		efsPath,
		workspaceType,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if workspaceType == "vscode" {
		_, err = h.q.UpdateVSCodeOnStart(c, db.UpdateVSCodeOnStartParams{
			ID:            inst.ID,
			VscodeTaskArn: sql.NullString{String: taskArn, Valid: true},
			VscodeIp:      sql.NullString{String: ip, Valid: true},
		})
	} else {
		_, err = h.q.UpdateJupyterOnStart(c, db.UpdateJupyterOnStartParams{
			ID:             inst.ID,
			JupyterTaskArn: sql.NullString{String: taskArn, Valid: true},
			JupyterIp:      sql.NullString{String: ip, Valid: true},
		})
	}

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"url": "/workspaces/" + inst.ID.String() + "?type=" + workspaceType,
	})
}

func (h *InstanceHandler) stopWorkspace(c *gin.Context, workspaceType string) {
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

	var taskArn sql.NullString
	if workspaceType == "vscode" {
		taskArn = inst.VscodeTaskArn
	} else {
		taskArn = inst.JupyterTaskArn
	}

	if !taskArn.Valid {
		c.JSON(400, gin.H{"error": "workspace not running"})
		return
	}

	_ = h.ecs.StopTask(c.Request.Context(), taskArn.String)

	if workspaceType == "vscode" {
		_ = h.q.ClearVSCodeData(c, inst.ID)
	} else {
		_ = h.q.ClearJupyterData(c, inst.ID)
	}

	c.JSON(200, gin.H{"message": "stopped"})
}

func (h *InstanceHandler) StartVSCode(c *gin.Context) {
	h.startWorkspace(c, "vscode")
}

// POST /instances/:id/start/jupyter
func (h *InstanceHandler) StartJupyter(c *gin.Context) {
	h.startWorkspace(c, "jupyter")
}

// POST /instances/:id/stop/vscode
func (h *InstanceHandler) StopVSCode(c *gin.Context) {
	h.stopWorkspace(c, "vscode")
}

// POST /instances/:id/stop/jupyter
func (h *InstanceHandler) StopJupyter(c *gin.Context) {
	h.stopWorkspace(c, "jupyter")
}