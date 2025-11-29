package api

import (
  "strings"
  "net/http"
  "github.com/gin-gonic/gin"
  "example.com/m/v2/util"
)

func JWTMiddleware() gin.HandlerFunc {
  return func(c *gin.Context) {
    auth := c.GetHeader("Authorization")
    if auth=="" { c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"err":"no token"}); return }
    parts := strings.SplitN(auth, " ", 2)
    if len(parts)!=2 { c.AbortWithStatusJSON(http.StatusUnauthorized, nil); return }
    userID, err := util.ParseJWT(parts[1])
    if err!=nil { c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"err":err.Error()}); return }
    c.Set("userID", userID)
    c.Next()
  }
}
