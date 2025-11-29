package api

import (
	db "example.com/m/v2/db/sqlc"

	"example.com/m/v2/util"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func SignupHandler(q *db.Queries) gin.HandlerFunc {
  return func(c *gin.Context) {
    var req struct{ Email, Password string }
    if err := c.BindJSON(&req); err != nil { c.JSON(400, gin.H{"err":err.Error()}); return }
    pwHash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
user, err := q.CreateUser(c, db.CreateUserParams{
    Email: req.Email,
    Password: string(pwHash),
})

    if err != nil { c.JSON(500, gin.H{"err":err.Error()}); return }
    c.JSON(200, gin.H{"id": user.ID})
  }
}

func LoginHandler(q *db.Queries) gin.HandlerFunc {
  return func(c *gin.Context) {
    var req struct{ Email, Password string }
    if err := c.BindJSON(&req); err != nil { c.JSON(400, gin.H{"err":err.Error()}); return }
    u, err := q.GetUserByEmail(c, req.Email)
if err != nil {
    c.JSON(401, gin.H{"err": "invalid"})
    return
}

if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)) != nil {
    c.JSON(401, gin.H{"err": "invalid"})
    return
}

    token, err := util.GenerateJWT(u.ID.String())
    if err != nil { c.JSON(500, gin.H{"err":err.Error()}); return }
    c.JSON(200, gin.H{"token": token})
  }
}
