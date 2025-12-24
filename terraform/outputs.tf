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
