package api

import (
  "github.com/gin-gonic/gin"
  db "example.com/m/v2/db/sqlc"
  "example.com/m/v2/ecs"
  "example.com/m/v2/util"
)

func SetupRouter(q *db.Queries, ecsMgr *ecsmanager.ECSManager, cfg *util.Config) *gin.Engine {
  r := gin.Default()

	// Public auth
	r.POST("/signup", SignupHandler(q))
	r.POST("/login", LoginHandler(q))

	// Authenticated routes
	auth := r.Group("/")
	auth.Use(JWTMiddleware())

	ih := NewInstanceHandler(q, ecsMgr)

	// Instance management
	auth.POST("/instances", ih.CreateInstance)
	auth.GET("/instances", ih.ListInstances)

	// Explicit workspace lifecycle
	auth.POST("/instances/:id/start/vscode", ih.StartVSCode)
	auth.POST("/instances/:id/start/jupyter", ih.StartJupyter)

	auth.POST("/instances/:id/stop/vscode", ih.StopVSCode)
	auth.POST("/instances/:id/stop/jupyter", ih.StopJupyter)

	auth.POST("/instances/:id/heartbeat", ih.Heartbeat)

	// Proxy entry – secure access
	auth.GET("/workspaces/:id/*path", WorkspaceProxy(cfg, q))

	return r
}
