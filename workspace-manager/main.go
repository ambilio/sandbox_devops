package main

import (
	"database/sql"
	"log"
	"time"

	"example.com/m/v2/api"
	db "example.com/m/v2/db/sqlc"
	"example.com/m/v2/ecs"
	"example.com/m/v2/util"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
}

func main() {
	// Load config
	cfg := util.LoadConfig() // should contain DatabaseURL and HTTPAddr

	// Setup database pool (production-ready)
	dbConn, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer dbConn.Close()
	// Initialize sqlc queries
	mainQueries := db.New(dbConn)

	// Initialize ECS manager
	ecsMgr, err := ecsmanager.NewECSManager()
	if err != nil {
		log.Fatalf("Cannot initialize ECS Manager: %v", err)
	}

	// Setup Gin router
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// CORS for frontend domains
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"X-Requested-With", "Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Middleware to set current user in session (optional)
	router.Use(func(c *gin.Context) {
		if ui, ok := c.Get("user_id"); ok {
			if userID, ok2 := ui.(int64); ok2 {
				if _, err := dbConn.ExecContext(c, "SET app.current_user_id = $1", userID); err != nil {
					log.Println("Error setting session user:", err)
				}
			}
		}
		c.Next()
	})

	// Make queries and pool available in context
	router.Use(func(c *gin.Context) {
		c.Set("queries", mainQueries)
		c.Set("db_pool", dbConn)
		c.Next()
	})

	// Register API routes
	apiRouter := api.SetupRouter(mainQueries, ecsMgr, cfg)
	router.Any("/*any", gin.WrapH(apiRouter)) // forward api routes

	log.Printf("Starting API on %s...", cfg.HTTPAddr)
	if err := router.Run(cfg.HTTPAddr); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
