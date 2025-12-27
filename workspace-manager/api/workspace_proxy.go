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

		userIDStr := c.GetString("userID")
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		instanceUUID, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid instance id"})
			return
		}

		inst, err := q.GetInstanceByID(c, instanceUUID)
		if err != nil || inst.UserID != userUUID {
			c.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		if !inst.ContainerID.Valid {
			c.JSON(404, gin.H{"error": "instance not running"})
			return
		}

		port := "80" // nginx in all workspaces
		targetURL, err := url.Parse(
			"http://" + inst.ContainerID.String + ":" + port,
		)
		if err != nil {
			c.JSON(500, gin.H{"error": "invalid target"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		proxy.Director = func(req *http.Request) {
			req.URL.Scheme = targetURL.Scheme
			req.URL.Host = targetURL.Host
			req.Host = targetURL.Host

			// 🔑 key fix
			req.URL.Path = "/"
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
