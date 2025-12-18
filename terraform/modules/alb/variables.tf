###########################################################
# VARIABLES — APPLICATION LOAD BALANCER
###########################################################

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "vpc_name" {
  description = "VPC name for tagging"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the ALB is deployed"
  type        = string
}

variable "lb_sg_id" {
  description = "Security group ID for the ALB"
  type        = string
}

variable "subnet_ids" {
  description = "List of public subnet IDs for multi-AZ ALB deployment"
  type        = list(string)
}

variable "name_prefix" {
  description = "Name prefix for ALB resources (e.g., 'web' or 'api')"
  type        = string
  default     = "web"
}

variable "is_internal" {
  description = "Set to true to create an internal ALB"
  type        = bool
  default     = false
}

variable "target_port" {
  description = "Port for the default listener and target group"
  type        = number
  default     = 80
}

variable "web_instance_ids" {
  description = "List of web server instance IDs to attach to target group"
  type        = list(string)
  default     = []
}

# Optional HTTPS Support
variable "enable_https" {
  description = "Enable HTTPS listener"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener"
  type        = string
  default     = ""
}
