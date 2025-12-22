package api

import (
	"github.com/gin-gonic/gin"
	db "example.com/m/v2/db/sqlc"
)

func SetupRouter(q *db.Queries) *gin.Engine {
	r := gin.Default()

	
	r.POST("/signup", SignupHandler(q))
	r.POST("/login", LoginHandler(q))

	auth := r.Group("/")
	auth.Use(JWTMiddleware())

	ih := NewInstanceHandler(q)

	auth.POST("/instances", ih.CreateInstance)
	auth.GET("/instances", ih.ListInstances)

	auth.POST("/instances/:id/start", ih.StartInstance)
	auth.POST("/instances/:id/stop", ih.StopInstance)
	auth.POST("/instances/:id/heartbeat", ih.Heartbeat)

	return r
}
