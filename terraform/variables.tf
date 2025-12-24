variable "aws_region" {
  default = "ap-southeast-1"
}

variable "vpc_name" {
  default = "NeuraSky-VPC"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "project_name" {
  default = "NeuraSky"
}

variable "deployment_environment" {
  default = "production"
}

# DB Secrets
variable "db_username" {
  default = "admin"
}
variable "db_password" {
  sensitive = true
}

# App Secrets
variable "secret_key" {
  sensitive = true
}

