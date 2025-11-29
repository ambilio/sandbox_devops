package util

import (
  "os"
)

type Config struct {
  DatabaseURL string
  HTTPAddr    string
  AWSRegion   string
  ECSCluster  string
  TaskDef     string
  SubnetIDs   []string
  SecurityGroups []string
  AlbDNS      string
}

func LoadConfig() *Config {
  return &Config{
    DatabaseURL: os.Getenv("DATABASE_URL"),
    HTTPAddr:    os.Getenv("HTTP_ADDR"),      // ":8080"
    AWSRegion:   os.Getenv("AWS_REGION"),
    ECSCluster:  os.Getenv("ECS_CLUSTER"),
    TaskDef:     os.Getenv("TASK_DEF"),
    SubnetIDs:   []string{os.Getenv("SUBNET_A"), os.Getenv("SUBNET_B")}, // adapt
    SecurityGroups: []string{os.Getenv("SEC_GRP")},
    AlbDNS: os.Getenv("ALB_DNS"),
  }
}
