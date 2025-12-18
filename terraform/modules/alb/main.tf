###############################################
# Application Load Balancer (Public)
###############################################

# Create the ALB
resource "aws_lb" "app_lb" {
  name               = "${var.vpc_name}-${var.name_prefix}-alb"
  internal           = var.is_internal
  load_balancer_type = "application"
  security_groups    = [var.lb_sg_id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false

  tags = {
    Name    = "${var.vpc_name}-${var.name_prefix}-alb"
    Project = var.project_name
  }
}

###############################################
# Target Group for Web Servers
###############################################
resource "aws_lb_target_group" "tg" {
  name     = "${var.vpc_name}-${var.name_prefix}-tg"
  port     = var.target_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/"
    matcher             = "200-499"
    interval            = 30
    healthy_threshold   = 3
    unhealthy_threshold = 2
    port                = var.target_port
  }

  tags = {
    Name = "${var.vpc_name}-${var.name_prefix}-tg"
  }
}

###############################################
# ALB Listener (HTTP - Port 80)
###############################################
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = var.target_port
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

###############################################
# Optional Future HTTPS Listener (Port 443)
###############################################
resource "aws_lb_listener" "https_listener" {
  count             = var.enable_https && !var.is_internal ? 1 : 0
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}
