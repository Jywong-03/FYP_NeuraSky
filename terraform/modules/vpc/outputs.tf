# -------------------------------
# VPC Outputs
# -------------------------------
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

# -------------------------------
# Subnet Outputs
# -------------------------------
output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "public_subnet_arns" {
  description = "List of public subnet ARNs"
  value       = [for subnet in aws_subnet.public : subnet.arn]
}

output "private_subnet_arns" {
  description = "List of private subnet ARNs"
  value       = [for subnet in aws_subnet.private : subnet.arn]
}

output "private_subnets_map" {
  description = "Map of private subnet IDs, keyed by their 'name' attribute "
  value       = { for name, subnet in aws_subnet.private : name => subnet.id }
}

# -------------------------------
# Internet Gateway Output
# -------------------------------
output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.igw.id
}

# -------------------------------
# NAT Gateway Outputs
# -------------------------------
output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs (if created)"
  value       = var.enable_nat_gateway ? [for nat in aws_nat_gateway.nat_gw : nat.id] : []
}

output "nat_eip_ids" {
  description = "List of Elastic IP IDs for NAT Gateways (if created)"
  value       = var.enable_nat_gateway ? [for eip in aws_eip.nat_eip : eip.id] : []
}

output "nat_eip_addresses" {
  description = "List of Elastic IP addresses for NAT Gateways (if created)"
  value       = var.enable_nat_gateway ? [for eip in aws_eip.nat_eip : eip.public_ip] : []
}

# -------------------------------
# Route Table Outputs
# -------------------------------
output "public_route_table_id" {
  description = "The ID of the public route table"
  value       = aws_route_table.public_rt.id
}

output "private_route_table_ids" {
  description = "List of private route table IDs (if NAT is enabled)"
  value       = var.enable_nat_gateway ? [for rt in aws_route_table.private_rt : rt.id] : []
}
