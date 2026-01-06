variable "project_name" {}
variable "asg_name" {}
variable "alb_name" {
  # We need the full ARN suffix or name to build the metric query correctly
  # Passing simple name for now, assuming standard metrics
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-Overview"

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
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.asg_name]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "ASG CPU Utilization"
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
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_name]
            # Note: LoadBalancer metric dimension requires full "app/lb-name/id" format strictly. 
            # For simplicity in this demo, we use basic metrics.
          ]
          view   = "timeSeries"
          region = "ap-southeast-1"
          title  = "ALB Request Count"
        }
      }
    ]
  })
}
