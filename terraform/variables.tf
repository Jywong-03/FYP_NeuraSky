# =========================================================
# Root Variables for NeuraSky Terraform Configuration
# =========================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "NeuraSky-VPC"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "project_name" {
  description = "Project name tag for all resources"
  type        = string
  default     = "NeuraSky"
}

variable "key_name" {
  description = "AWS key pair name to use for SSH access (Optional)"
  type        = string
  default     = "" # Empty string means no SSH Key (access via SSM recommended)
}

# =========================================================
# Database Variables
# =========================================================

variable "db_name" {
  description = "The name of the database to create"
  type        = string
  default     = "neurasky_db"
}

variable "db_username" {
  description = "Master username for the RDS database"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Master password for the RDS database"
  type        = string
  default     = "neuraskypassword123"
  sensitive   = true
}

# =========================================================
# Application Variables
# =========================================================

variable "secret_key" {
  description = "Django Secret Key"
  type        = string
  default     = "django-insecure-change-me-in-production!"
  sensitive   = true
}

variable "rapidapi_key" {
  description = "RapidAPI Key for Flight Data"
  type        = string
  default     = ""
  sensitive   = true
}

# Note: Domain and Alerting variables removed as they are not used in the initial refactor.
