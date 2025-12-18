variable "project_name" {}

variable "web_asg_name" {}

variable "alb_arn_suffix" {}

variable "db_instance_id" {}

variable "alert_email" {
  description = "Email address to send alerts to"
  type        = string
}

variable "api_asg_name" {
  description = "Name of the API Auto Scaling Group"
  type        = string
}