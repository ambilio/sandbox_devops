package api

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	db "example.com/m/v2/db/sqlc"
	"example.com/m/v2/util"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func WorkspaceProxy(cfg *util.Config, q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ✅ Auth: user from JWT
		userIDStr := c.GetString("userID")
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		// ✅ Instance ID
		instanceIDStr := c.Param("id")
		instanceUUID, err := uuid.Parse(instanceIDStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid instance id"})
			return
		}

		// ✅ Load instance
		inst, err := q.GetInstanceByID(c, instanceUUID)
		if err != nil || inst.UserID != userUUID {
			c.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		if !inst.ContainerIp.Valid {
			c.JSON(404, gin.H{"error": "instance not running"})
			return
		}

		// ✅ Decide port by instance type
		var port string
		switch inst.Type {
		case "vscode":
			port = "8080"
		case "jupyter":
			port = "8888"
		default:
			c.JSON(400, gin.H{"error": "unknown instance type"})
			return
		}

		targetURL, err := url.Parse("http://" + inst.ContainerIp.String + ":" + port)
		if err != nil {
			c.JSON(500, gin.H{"error": "invalid target"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		// ✅ Preserve path + websocket support
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.Host = targetURL.Host
			req.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/workspaces/"+inst.ID.String())
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
