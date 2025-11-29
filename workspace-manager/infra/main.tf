terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}

provider "aws" { region = var.region }

resource "aws_efs_file_system" "workspaces" {
  creation_token = "workspace-efs"
  lifecycle { prevent_destroy = false }
}

resource "aws_efs_mount_target" "mt_a" {
  file_system_id = aws_efs_file_system.workspaces.id
  subnet_id = var.subnet_1
  security_groups = [var.efs_sg]
}

resource "aws_ecs_cluster" "cluster" {
  name = "ambilio"
}
