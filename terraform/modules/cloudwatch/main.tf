variable "project_name" {}
variable "asg_name" {}
variable "target_group_arns" {
  type = list(string)
}
variable "sns_topic_arn" {
  description = "SNS Topic for Alarm Notifications (Optional)"
  default     = ""
}

# 1. CPU High Alarm (for ASG)
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
}

# 2. Unhealthy Host Count (for Target Groups)
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  count               = length(var.target_group_arns)
  alarm_name          = "${var.project_name}-unhealthy-hosts-${count.index}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "Target Group has unhealthy hosts"

  dimensions = {
    TargetGroup  = split(":", var.target_group_arns[count.index])[5] # Extract TG Name/ID
    LoadBalancer = "app/${var.project_name}-alb"                     # Approximate, clearer if passed explicitly
  }
}
