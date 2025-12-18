# -------------------------------
# VPC Configuration
# -------------------------------
variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "azs" {
  description = "List of Availability Zones"
  type        = list(string)
}

# -------------------------------
# Subnet Configuration
# -------------------------------
variable "public_subnets" {
  description = "List of public subnet configurations"
  type = list(object({
    name = string
    cidr = string
    az   = string
  }))
}

variable "private_subnets" {
  description = "List of private subnet configurations"
  type = list(object({
    name = string
    cidr = string
    az   = string
  }))
}

# -------------------------------
# NAT Gateway Configuration
# -------------------------------
variable "enable_nat_gateway" {
  description = "Whether to create a NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "enable_multi_nat" {
  description = "Whether to create multiple NAT Gateways (one per public subnet)"
  type        = bool
  default     = false
}

variable "single_nat_index" {
  description = "Index of the public subnet to place a single NAT Gateway when multi NAT is disabled"
  type        = number
  default     = 0
}
