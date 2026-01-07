variable "project_name" {}
variable "alb_dns_name" {}
variable "domain_name" {
  description = "The main domain name (e.g., example.com)"
}
variable "acm_certificate_arn" {}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "ALB-${var.alb_dns_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "match-viewer"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "CloudFront for ${var.project_name}"

  # Aliases (CNAMEs) - Essential for custom domain access
  aliases = [var.domain_name]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${var.alb_dns_name}"

    forwarded_values {
      query_string = true
      headers      = ["*"] # Forward all headers to ALB (important for dynamic apps)

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0 # Dynamic content, don't cache by default unless specified
    max_ttl                = 86400
  }

  price_class = "PriceClass_100" # Cheapest (US/Europe only)

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name    = "${var.project_name}-cf"
    Project = var.project_name
  }
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}
