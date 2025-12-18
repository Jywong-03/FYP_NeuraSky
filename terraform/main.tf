############################################################
# Root-Level Terraform Configuration for NeuraSky Project
############################################################
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

# Used for WAF/ACM if needed (Global resources)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

############################################################
# VPC Module
############################################################
module "vpc" {
  source = "./modules/vpc"

  vpc_name   = var.vpc_name
  cidr_block = var.vpc_cidr
  azs        = var.availability_zones

  public_subnets = [
    { name = "public-subnet-1", cidr = "10.0.1.0/24", az = "ap-southeast-1a" },
    { name = "public-subnet-2", cidr = "10.0.2.0/24", az = "ap-southeast-1b" }
  ]

  # Simplified Private Subnets (1 per AZ)
  private_subnets = [
    { name = "private-subnet-1", cidr = "10.0.3.0/24", az = "ap-southeast-1a" },
    { name = "private-subnet-2", cidr = "10.0.4.0/24", az = "ap-southeast-1b" }
  ]

  enable_nat_gateway = true
  enable_multi_nat   = false # Save cost: only 1 NAT Gateway
  single_nat_index   = 0
}

############################################################
# Security Groups Module
############################################################
# We need to detect our IP for the bastion/admin access
data "http" "my_ip" {
  url = "https://checkip.amazonaws.com/"
}
locals {
  admin_ip = "${chomp(data.http.my_ip.response_body)}/32"
}

module "security_groups" {
  source   = "./modules/security_groups"
  vpc_id   = module.vpc.vpc_id
  vpc_name = var.vpc_name
  admin_ip = local.admin_ip
}

############################################################
# Database Layer Module (RDS - MySQL)
############################################################
module "database" {
  source       = "./modules/database"
  project_name = var.project_name
  vpc_name     = var.vpc_name

  private_subnet_ids = module.vpc.private_subnet_ids
  db_sg_id           = module.security_groups.db_sg_id

  db_name     = "neurasky_db"
  db_username = "admin"
  db_password = "neuraskypassword123" # In production, use Secrets Manager!
}

############################################################
# Application Load Balancer Module (Public)
############################################################
module "alb" {
  source       = "./modules/alb"
  project_name = var.project_name
  vpc_name     = var.vpc_name
  vpc_id       = module.vpc.vpc_id
  lb_sg_id     = module.security_groups.lb_sg_id
  subnet_ids   = module.vpc.public_subnet_ids # ALB sits in public subnets
  name_prefix  = "web"
  is_internal  = false
  target_port  = 3000 # Forwarding to Frontend Port
  enable_https = false
}

############################################################
# Web Server Module (Auto Scaling Group)
############################################################
module "web_server" {
  source            = "./modules/web_server"
  vpc_name          = var.vpc_name
  project_name      = var.project_name
  public_subnet_ids = module.vpc.public_subnet_ids
  web_sg_id         = module.security_groups.web_sg_id
  key_name          = var.key_name
  instance_type     = "t3.micro"
  root_volume_size  = 10

  # Note: The original sample used IAM Instance Profiles. 
  # We are setting this merely to satisfy the module variable if required, 
  # but if the module expects a profile that doesn't exist, we might need to create it 
  # via the IAM module or set it to empty string if allowed.
  # Checking usage: The sample created 'DDAC-web-ec2-profile'. We will create it below.
  iam_instance_profile_name = module.iam_web.instance_profile_name
  log_group_name            = "neurasky-web-logs"

  asg_min_size         = 1
  asg_desired_capacity = 1
  asg_max_size         = 2

  alb_target_group_arn = module.alb.alb_target_group_arn

  # This User Data installs Docker and runs the NeuraSky App
  user_data = <<-EOF
              #!/bin/bash
              
              # 1. Install Docker & Docker Compose
              apt-get update
              apt-get install -y ca-certificates curl gnupg
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              chmod a+r /etc/apt/keyrings/docker.gpg
              echo \
                "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
                tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              # 2. Clone Repository
              cd /home/ubuntu
              git clone https://github.com/jywong-03/fyp_neurasky.git
              cd fyp_neurasky

              # 3. Create .env file for Backend
              # Using the RDS Endpoint from the database module
              echo "DB_HOST=${module.database.db_address}" >> backend_neurasky/.env
              echo "DB_PORT=3306" >> backend_neurasky/.env
              echo "DB_NAME=neurasky_db" >> backend_neurasky/.env
              echo "DB_USER=admin" >> backend_neurasky/.env
              echo "DB_PASSWORD=neuraskypassword123" >> backend_neurasky/.env

              # 4. Start Application
              # The ALB forwards port 80 -> Instance Port 3000 (Target Group Default).
              # Ensure the frontend runs on 3000.
              # BUT: We also have a backend on 8000. 
              # In a simple Mono-ASG setup, the ALB usually forwards /api to 8000 and / to 3000.
              # The sample module 'alb' creates one Target Group attached to one port.
              # For simplicity, we assume the Frontend is the main entry point.
              docker compose up -d --build
              EOF
}

############################################################
# IAM Module (Required mostly for SSM/Instance Profile)
############################################################
module "iam_web" {
  source                = "./modules/iam"
  manage_role           = true
  role_name             = "NeuraSky-web-ec2-role"
  instance_profile_name = "NeuraSky-web-ec2-profile"
  project               = var.project_name
}
