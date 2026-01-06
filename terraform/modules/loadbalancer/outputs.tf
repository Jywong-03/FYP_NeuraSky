output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "frontend_tg_arn" {
  value = aws_lb_target_group.frontend.arn
}

output "backend_tg_arn" {
  value = aws_lb_target_group.backend.arn
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_name" {
  value = aws_lb.main.arn_suffix # Returns "app/my-load-balancer/50dc6c495c0c9188" format
}
