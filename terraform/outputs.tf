output "vpc_id" {
  value = module.network.vpc_id
}

output "alb_dns_name" {
  value = module.loadbalancer.alb_dns_name
}

output "db_endpoint" {
  value = module.database.db_endpoint
}

output "asg_name" {
  value = module.compute.asg_name
}

output "cloudfront_domain" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_domain_name
}

output "s3_logs_bucket" {
  description = "The S3 bucket used for ALB access logs"
  value       = aws_s3_bucket.alb_logs.bucket
}

output "s3_data_bucket" {
  description = "The S3 bucket used for database backups"
  value       = aws_s3_bucket.data.bucket
}
