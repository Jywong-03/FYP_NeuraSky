###############################################
# Variables for Private API Module
###############################################

variable "vpc_name" {
  description = "VPC name for tagging purposes"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs where API instances are deployed"
  type        = list(string)
}

variable "api_sg_id" {
  description = "Security group ID for API instances"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name (for bastion access)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for API layer"
  type        = string
  default     = "t3.small"
}

variable "root_volume_size" {
  description = "Root volume size for API instances (GB)"
  type        = number
  default     = 8
}

variable "alb_target_group_arn" {
  description = "ARN of the ALB Target Group to attach API instances to"
  type        = string
  default     = ""
}

variable "enable_alb_attachment" {
  description = "Set to true to attach these instances to an ALB"
  type        = bool
  default     = false
}

variable "asg_min_size" {
  description = "Minimum number of API instances"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum number of API instances"
  type        = number
  default     = 2
}

variable "asg_desired_capacity" {
  description = "Desired number of API instances"
  type        = number
  default     = 2
}

variable "iam_instance_profile_name" {
  description = "IAM Instance Profile to assign to API instances"
  type        = string
}

variable "db_secret_name" {
  description = "Name of the Secrets Manager secret to retrieve"
  type        = string
}

variable "log_group_name" {
  description = "CloudWatch Log Group name for application logs"
  type        = string
}