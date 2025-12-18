###############################################
# Outputs for Bastion Host (Multi-AZ Compatible)
###############################################

# List of Bastion instance IDs
output "bastion_instance_ids" {
  description = "List of Bastion EC2 instance IDs"
  value       = [for i in aws_instance.bastion : i.id]
}

# List of public IPs (Elastic IPs if assigned, otherwise instance public IPs)
output "bastion_public_ips" {
  description = "List of Bastion public IPs (Elastic IPs if assign_eip = true)"
  value       = var.assign_eip ? [for e in aws_eip.bastion_eip : e.public_ip] : [for i in aws_instance.bastion : i.public_ip]
}

# List of Public DNS names
output "bastion_public_dns" {
  description = "List of Bastion public DNS names"
  value       = [for i in aws_instance.bastion : i.public_dns]
}

# Combined output for better readability
output "bastion_summary" {
  description = "Structured summary of deployed Bastion hosts (ID, IP, DNS)"
  value = [
    for idx in range(length(aws_instance.bastion)) : {
      instance_id = aws_instance.bastion[idx].id
      public_ip   = var.assign_eip ? aws_eip.bastion_eip[idx].public_ip : aws_instance.bastion[idx].public_ip
      public_dns  = aws_instance.bastion[idx].public_dns
      az          = aws_instance.bastion[idx].availability_zone
    }
  ]
}
