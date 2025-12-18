variable "domain_name" {
  description = "The primary domain name (e.g., example.com)"
  type        = string
}

variable "zone_id" {
  description = "The Route 53 Hosted Zone ID"
  type        = string
}