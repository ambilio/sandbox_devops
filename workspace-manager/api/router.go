package api

import (
  "github.com/gin-gonic/gin"
  db "example.com/m/v2/db/sqlc"
  ecsmanager "example.com/m/v2/ecs"
  "example.com/m/v2/util"
)

func SetupRouter(q *db.Queries, ecsMgr *ecsmanager.ECSManager, cfg *util.Config) *gin.Engine {
	r := gin.Default()

	r.POST("/signup", SignupHandler(q))
	r.POST("/login", LoginHandler(q))

	auth := r.Group("/")
	auth.Use(JWTMiddleware())

	ih := NewInstanceHandler(q, ecsMgr)

	auth.POST("/instances", ih.CreateInstance)
	auth.GET("/instances", ih.ListInstances)

	auth.POST("/instances/:id/start", ih.StartInstance)
	auth.POST("/instances/:id/stop", ih.StopInstance)

	auth.POST("/instances/:id/heartbeat", ih.Heartbeat)

	auth.GET("/workspaces/:id/*path", WorkspaceProxy(cfg, q))

	return r
}
