###########################################################
# OUTPUTS — APPLICATION LOAD BALANCER
###########################################################

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.app_lb.dns_name
}

output "alb_arn" {
  description = "ARN of the ALB"
  value       = aws_lb.app_lb.arn
}

output "alb_target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.tg.arn // CHANGED
}

output "alb_arn_suffix" {
  value = aws_lb.app_lb.arn_suffix
}