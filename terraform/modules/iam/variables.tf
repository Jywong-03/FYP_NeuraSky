############################################################
# Input Variables — IAM Module
############################################################

variable "manage_role" {
  description = "If true, Terraform will create the IAM role/policy/profile. If false, it uses existing ones."
  type        = bool
  default     = true
}

variable "role_name" {
  description = "IAM Role name to create or reference."
  type        = string
}

variable "instance_profile_name" {
  description = "Instance profile name to create or reference."
  type        = string
}

variable "project" {
  description = "Project tag identifier (used in tags)."
  type        = string
  default     = "DDAC"
}

variable "s3_buckets" {
  description = "List of S3 buckets this role can read from."
  type        = list(string)
  default     = []
}
