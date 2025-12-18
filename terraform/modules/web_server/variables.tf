variable "project_name" {
  type = string
}

variable "vpc_name" {
  type    = string
  default = ""
}

variable "ami_id" {
  type    = string
  default = ""
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "key_name" {
  type    = string
  default = ""
}

variable "web_sg_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "asg_min_size" {
  type    = number
  default = 1
}

variable "asg_max_size" {
  type    = number
  default = 2
}

variable "asg_desired_capacity" {
  type    = number
  default = 1
}

variable "root_volume_size" {
  type    = number
  default = 30
}

variable "user_data" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "alb_target_group_arn" {
  type    = string
  default = ""
}

variable "health_check_grace_period" {
  type    = number
  default = 300
}

variable "associate_public_ip" {
  type    = bool
  default = true
}

# NEW: instance profile name must be provided by root module (from modules/iam)
variable "iam_instance_profile_name" {
  type = string
}

variable "api_alb_dns_name" {
  description = "Internal DNS name for the API load balancer"
  type        = string
  default     = ""
}

variable "log_group_name" {
  description = "CloudWatch Log Group name for application logs"
  type        = string
}