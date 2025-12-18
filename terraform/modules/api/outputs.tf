###############################################
# Outputs for Private API ASG
###############################################

output "asg_name" {
  description = "Auto Scaling Group name for API servers"
  value       = aws_autoscaling_group.api_asg.name
}