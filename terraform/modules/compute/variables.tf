variable "project_name" {}
variable "vpc_name" {}
variable "vpc_id" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "app_sg_id" {}
variable "key_name" {
  default = ""
}
variable "instance_type" {
  default = "t3.small" # Increased to t3.small for Docker performance
}
variable "frontend_tg_arn" {}
variable "backend_tg_arn" {}

# Environment Variables for App
variable "db_address" {}
variable "db_name" {}
variable "db_username" {}

variable "alb_dns_name" {}

variable "domain_name" {}
