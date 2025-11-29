package util

import (
  "time"
  "github.com/golang-jwt/jwt/v5"
  "os"
)

var jwtSecret = []byte(func() string { if s:=os.Getenv("JWT_SECRET"); s!="" {return s}; return "dev-secret" }())

func GenerateJWT(userID string) (string, error) {
  t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "sub": userID, "exp": time.Now().Add(24*time.Hour).Unix(),
  })
  return t.SignedString(jwtSecret)
}

func ParseJWT(tokenStr string) (string, error) {
  t, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) { return jwtSecret, nil })
  if err != nil { return "", err }
  if claims, ok := t.Claims.(jwt.MapClaims); ok && t.Valid {
    return claims["sub"].(string), nil
  }
  return "", err
}
