variable "project_name" {}
variable "vpc_name" {}
variable "vpc_id" {}
variable "public_subnet_ids" {
  type = list(string)
}
variable "alb_sg_id" {}

variable "certificate_arn" {
  description = "ARN of the SSL Certificate"
  type        = string
}
