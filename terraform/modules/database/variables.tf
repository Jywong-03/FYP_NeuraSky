variable "project_name" {}
variable "vpc_name" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "db_sg_id" {}
variable "db_name" {}
variable "db_username" {}
variable "db_password" {}
