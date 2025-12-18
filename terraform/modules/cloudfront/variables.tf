variable "project_name" {
  type = string
}

variable "alb_dns_name" {
  description = "The DNS name of the Public ALB (Origin)"
  type        = string
}

variable "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL to attach"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the CDN"
  type        = string
  default     = "residentpro.click"
}

variable "acm_certificate_arn" {
  description = "ACM Certificate ARN for HTTPS"
  type        = string
  default     = ""
}