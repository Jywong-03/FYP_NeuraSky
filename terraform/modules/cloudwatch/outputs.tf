output "dashboard_link" {
  value = "https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "web_log_group_name" {
  value = aws_cloudwatch_log_group.web_logs.name
}

output "api_log_group_name" {
  value = aws_cloudwatch_log_group.api_logs.name
}