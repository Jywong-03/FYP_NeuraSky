variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "vpc_name" {
  description = "VPC Name"
  type        = string
}

variable "project_name" {
  description = "Project Name"
  type        = string
}

variable "admin_ip" {
  description = "Admin IP for SSH access (optional)"
  type        = string
  default     = "0.0.0.0/0"
}
