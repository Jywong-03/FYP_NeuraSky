###########################################################
# OUTPUTS — WEB SERVER MODULE (ASG)
###########################################################

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.web_asg.name
}

# Provide a placeholder for web_eip_addresses (empty by default).
# We removed per-instance EIP creation; keep this output for backwards compatibility but empty.
output "web_eip_addresses" {
  description = "EIP addresses assigned to web instances (not configured by default for ASG)"
  value       = []
}
