resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-web-acl"
  description = "WAF for CloudFront"
  scope       = "CLOUDFRONT" # Must be CLOUDFRONT for CDN

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf-metric"
    sampled_requests_enabled   = true
  }

  # Rule 0: Allow Uploads to /api/Reports (Bypass WAF for images)
  rule {
    name     = "AllowUploads"
    priority = 0

    action {
      allow {}
    }

    statement {
      byte_match_statement {
        search_string = "/api/Reports"
        field_to_match {
          uri_path {}
        }
        text_transformation {
          priority = 0
          type     = "NONE"
        }
        positional_constraint = "STARTS_WITH"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AllowUploads"
      sampled_requests_enabled   = true
    }
  }

  # Rule 1: AWS Managed Common Rule Set (Blocks OWASP Top 10 threats)
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }
}