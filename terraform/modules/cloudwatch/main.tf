# ---------------------------------------------------------
# 1. SNS Topic for Alerts (The Email System)
# ---------------------------------------------------------
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts-topic"
}

resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ---------------------------------------------------------
# 2. CPU Alarm (The Trigger)
# ---------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "web_cpu_high" {
  alarm_name          = "${var.project_name}-web-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120" # Check every 2 minutes
  statistic           = "Average"
  threshold           = "80" # Trigger if CPU > 80%
  alarm_description   = "This metric monitors Web ASG CPU utilization"
  actions_enabled     = true

  # Send notification to the SNS topic we created above
  alarm_actions = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.web_asg_name
  }
}

# ---------------------------------------------------------
# 3. Dashboard (The Visuals)
# ---------------------------------------------------------
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-Main-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.web_asg_name, { "label" : "Web Tier CPU" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Web Server CPU Usage"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.db_instance_id, { "label" : "Database CPU" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Database CPU Usage"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 24
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { "label" : "Total Requests" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Public Traffic Volume"
        }
      },
      {
        type   = "metric",
        x      = 12,
        y      = 6,
        width  = 12,
        height = 6,
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.api_asg_name, { "label" : "API Tier CPU" }]
          ],
          view    = "timeSeries",
          stacked = false,
          region  = "ap-southeast-1",
          title   = "API Server CPU Usage"
        }
      }
    ]
  })
}

# ---------------------------------------------------------
# 4. Centralized Log Groups
# ---------------------------------------------------------
resource "aws_cloudwatch_log_group" "web_logs" {
  name              = "/aws/ec2/${var.project_name}-web-app"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/ec2/${var.project_name}-api-app"
  retention_in_days = 7
}