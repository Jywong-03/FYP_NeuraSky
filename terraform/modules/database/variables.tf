###########################################################
# VARIABLES — DATABASE MODULE
###########################################################

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "vpc_name" {
  description = "VPC name for resource naming"
  type        = string
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs for the DB Subnet Group"
  type        = list(string)
}

variable "db_sg_id" {
  description = "The ID of the database security group"
  type        = string
}

variable "db_name" {
  description = "The name of the database to create"
  type        = string
}

variable "db_username" {
  description = "The master username for the database"
  type        = string
}

variable "db_password" {
  description = "The master password for the database"
  type        = string
  sensitive   = true # Hides the password from Terraform output
}