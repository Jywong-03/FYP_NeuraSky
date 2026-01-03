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
  db_password = var.db_password
  secret_key  = var.secret_key

  # SES Secrets
  aws_ses_user     = var.aws_ses_user
  aws_ses_password = var.aws_ses_password
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
    name                   = module.loadbalancer.alb_dns_name
    zone_id                = module.loadbalancer.alb_zone_id
    evaluate_target_health = true
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
