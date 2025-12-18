output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "database_endpoint" {
  description = "The endpoint of the RDS database"
  value       = module.database.db_address
}

output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

# The web server output is now via the Load Balancer, not a single IP
output "application_url" {
  description = "URL to access the application"
  value       = "http://${module.alb.alb_dns_name}:3000"
}
