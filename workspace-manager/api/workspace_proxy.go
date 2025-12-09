package api

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	db "example.com/m/v2/db/sqlc"
	"example.com/m/v2/util"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func WorkspaceProxy(cfg *util.Config, q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ✅ get user from JWT
		userIDStr := c.GetString("userID")
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		// ✅ instance ID
		instanceIDStr := c.Param("id")
		instanceUUID, err := uuid.Parse(instanceIDStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid instance"})
			return
		}

		workspaceType := c.Query("type")
		if workspaceType != "vscode" && workspaceType != "jupyter" {
			c.JSON(400, gin.H{"error": "invalid workspace type"})
			return
		}

		// ✅ load instance
		inst, err := q.GetInstanceByID(c, instanceUUID)
		if err != nil || inst.UserID != userUUID {
			c.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		// ✅ select correct IP
		var targetIP string
		var port string

		if workspaceType == "vscode" {
			if !inst.VscodeIp.Valid {
				c.JSON(404, gin.H{"error": "vscode not running"})
				return
			}
			targetIP = inst.VscodeIp.String
			port = "8080"
		} else {
			if !inst.JupyterIp.Valid {
				c.JSON(404, gin.H{"error": "jupyter not running"})
				return
			}
			targetIP = inst.JupyterIp.String
			port = "8888"
		}

		targetURL, err := url.Parse("http://" + targetIP + ":" + port)
		if err != nil {
			c.JSON(500, gin.H{"error": "bad target"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		// ✅ WebSocket + headers fix
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.Host = targetURL.Host
			req.URL.Path = c.Param("path")
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

