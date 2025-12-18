###########################################################
# VARIABLES — SECURITY GROUP MODULE
###########################################################

# -------------------------------
# VPC Information
# -------------------------------
variable "vpc_id" {
  description = "ID of the VPC to associate security groups with"
  type        = string
}

variable "vpc_name" {
  description = "VPC name used for tagging and naming resources"
  type        = string
}

# -------------------------------
# Administrative Access Control
# -------------------------------
variable "admin_ip" {
  description = "Public IP address of the administrator (in CIDR format)"
  type        = string
}

variable "enable_web_ssh" {
  description = "Whether to allow SSH access to web servers from admin IP"
  type        = bool
  default     = true
}

# -------------------------------
# Optional Parameters (Future-proofing)
# -------------------------------
variable "api_port" {
  description = "Port used by backend API services"
  type        = number
  default     = 5000
}

variable "db_port" {
  description = "Database port (e.g., MySQL default is 3306)"
  type        = number
  default     = 3306
}
