terraform {
  backend "s3" {
    bucket         = "neurasky-fyp-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "neurasky-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}

# S3 Bucket for ALB Logs
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "neurasky-alb-logs-${var.aws_region}"
  force_destroy = true
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire_old_logs"
    status = "Enabled"

    expiration {
      days = 90
    }
  }
}

# Policy to allow ALB to write to bucket
resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::114774131450:root" # ELB Account ID for ap-southeast-1
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket for Database Dumps
resource "aws_s3_bucket" "data" {
  bucket_prefix = "neurasky-data-"
  force_destroy = false # Safety: Prevent deleting bucket if it has data
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 1. Network Module
module "network" {
  source       = "./modules/network"
  vpc_name     = var.vpc_name
  vpc_cidr     = var.vpc_cidr
  project_name = var.project_name
  azs          = ["ap-southeast-1a", "ap-southeast-1b"]
}

# 2. Security Module
module "security" {
  source       = "./modules/security"
  vpc_name     = var.vpc_name
  vpc_id       = module.network.vpc_id
  project_name = var.project_name
}

# 3. Database Module
module "database" {
  source             = "./modules/database"
  vpc_name           = var.vpc_name
  project_name       = var.project_name
  private_subnet_ids = module.network.private_subnet_ids
  db_sg_id           = module.security.db_sg_id
  db_name            = "neurasky_db"
  db_username        = var.db_username
  db_password        = var.db_password
}

# 4. Load Balancer Module
module "loadbalancer" {
  source            = "./modules/loadbalancer"
  vpc_name          = var.vpc_name
  vpc_id            = module.network.vpc_id
  project_name      = var.project_name
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn
  s3_logs_bucket    = aws_s3_bucket.alb_logs.id
}

# 5. Compute Module
module "compute" {
  source             = "./modules/compute"
  vpc_name           = var.vpc_name
  vpc_id             = module.network.vpc_id
  project_name       = var.project_name
  private_subnet_ids = module.network.private_subnet_ids
  app_sg_id          = module.security.app_sg_id

  frontend_tg_arn = module.loadbalancer.frontend_tg_arn
  backend_tg_arn  = module.loadbalancer.backend_tg_arn
  alb_dns_name    = module.loadbalancer.alb_dns_name
  domain_name     = var.domain_name


  # Secrets
  db_address  = module.database.db_address
  db_name     = "neurasky_db"
  db_username = var.db_username
  # Secrets removed, handled via SSM

  # SES Secrets removed, handled via SSM
}

# 8. CloudWatch Alarms
module "cloudwatch" {
  source       = "./modules/cloudwatch"
  project_name = var.project_name
  asg_name     = module.compute.asg_name
  target_group_arns = [
    module.loadbalancer.frontend_tg_arn,
    module.loadbalancer.backend_tg_arn
  ]
}

# SSM Parameters for Secrets
resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/db_password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "secret_key" {
  name  = "/${var.project_name}/secret_key"
  type  = "SecureString"
  value = var.secret_key
}

resource "aws_ssm_parameter" "ses_user" {
  name  = "/${var.project_name}/ses_user"
  type  = "SecureString"
  value = var.aws_ses_user
}

resource "aws_ssm_parameter" "ses_password" {
  name  = "/${var.project_name}/ses_password"
  type  = "SecureString"
  value = var.aws_ses_password
}

# 9. CloudFront (Free Tier CDN)
module "cloudfront" {
  source       = "./modules/cloudfront"
  project_name = var.project_name
  alb_dns_name = module.loadbalancer.alb_dns_name
  domain_name  = var.domain_name
}

# 10. AWS Budget (Cost Control)
module "budget" {
  source        = "./modules/budget"
  project_name  = var.project_name
  email_address = var.alert_email
}

# 6. Route 53 DNS
data "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.cloudfront.cloudfront_domain_name
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront Global Zone ID
    evaluate_target_health = false
  }
}

# 7. ACM Certificate & Validation
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => dvo
  }

  allow_overwrite = true
  name            = each.value.resource_record_name
  records         = [each.value.resource_record_value]
  ttl             = 60
  type            = each.value.resource_record_type
  zone_id         = data.aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# 11. CloudWatch Dashboard (Overview)
module "dashboard" {
  source       = "./modules/dashboard"
  project_name = var.project_name
  asg_name     = module.compute.asg_name
  alb_name     = module.loadbalancer.alb_name
}

# 12. Resource Group (Organization)
resource "aws_resourcegroups_group" "main" {
  name = "${var.project_name}-Resources"

  resource_query {
    query = <<JSON
{
  "ResourceTypeFilters": ["AWS::AllSupported"],
  "TagFilters": [
    {
      "Key": "Project",
      "Values": ["${var.project_name}"]
    }
  ]
}
JSON
  }
}
