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


variable "domain_name" {
  description = "The domain name for the website"
  type        = string
  default     = "neurasky.click"
}

# AWS SES Secrets
variable "aws_ses_user" {
  sensitive = true
}

variable "aws_ses_password" {
  sensitive = true
}
