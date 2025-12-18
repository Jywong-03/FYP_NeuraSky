###########################################################
# Web Server Module — Launch Template + Auto Scaling Group
# - Assumes IAM instance profile is managed outside this module
# - Optional ALB target group integration
# - Uses SSM-friendly instance profile rather than SSH keys by default
###########################################################

# Fallback AMI (Canonical Ubuntu 22.04) if no ami_id provided
data "aws_ami" "ubuntu" {
  count       = var.ami_id == "" ? 1 : 0
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  ami_resolved = var.ami_id != "" ? var.ami_id : (length(data.aws_ami.ubuntu) > 0 ? data.aws_ami.ubuntu[0].id : "")
  common_tags = merge({
    Project = var.project_name
    VPC     = var.vpc_name
  }, var.tags)

  # Internal ALB DNS (Backend)
  api_endpoint = var.api_alb_dns_name != "" ? "http://${var.api_alb_dns_name}:5000" : "http://localhost:5000"

  userdata_script = var.user_data != "" ? var.user_data : <<-EOF
    #!/bin/bash
    apt-get update -y
    # Install Docker & Nginx
    apt-get install -y docker.io nginx
    systemctl start docker
    systemctl enable docker
    systemctl enable nginx

    # 1. RUN FRONTEND CONTAINER
    # Replace with your actual Docker Hub image
    # Assuming your frontend container listens on port 3000 internally
    docker run -d \
      --restart always \
      --name frontend-app \
      -p 3000:3000 \
      --log-driver=awslogs \
      --log-opt awslogs-region=ap-southeast-1 \
      --log-opt awslogs-group=${var.log_group_name} \
      --log-opt awslogs-stream=web-instance-$(hostname) \
      peekachiu/ddac-frontend:Production

    # 2. CONFIGURE NGINX (The Reverse Proxy)
    cat > /etc/nginx/sites-available/default <<NGINX_CONF
    server {
        listen 80 default_server;
        server_name _;

        # Route 1: Forward API requests to the Backend ALB
        location /api {
            proxy_pass ${local.api_endpoint};
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }

        # Route 2: Forward all other requests to the local Frontend Container
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
    NGINX_CONF
    
    # Restart Nginx to apply changes
    nginx -t
    systemctl restart nginx
    
    echo "Frontend Deployed!" > /etc/motd
  EOF
}

###########################################################
# NOTE: IAM resources removed from this module.
# Provide the instance profile name via variable:
#   iam_instance_profile_name = module.iam_web.instance_profile_name
# or pass an existing instance profile name directly.
###########################################################

resource "aws_launch_template" "web_lt" {
  name_prefix   = "${var.project_name}-web-lt-"
  image_id      = local.ami_resolved
  instance_type = var.instance_type

  # Use externally-managed instance profile (required)
  iam_instance_profile {
    name = var.iam_instance_profile_name
  }

  # key_name is optional; ASG + SSM allows you to omit SSH key
  key_name = var.key_name != "" ? var.key_name : null

  network_interfaces {
    security_groups             = [var.web_sg_id]
    associate_public_ip_address = var.associate_public_ip != null ? var.associate_public_ip : true
  }

  user_data = base64encode(local.userdata_script)

  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size           = var.root_volume_size
      volume_type           = "gp3"
      delete_on_termination = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags          = merge(local.common_tags, { Name = "${var.vpc_name}-web" })
  }
}

resource "aws_autoscaling_group" "web_asg" {
  name                = "${var.project_name}-web-asg"
  desired_capacity    = var.asg_desired_capacity
  max_size            = var.asg_max_size
  min_size            = var.asg_min_size
  vpc_zone_identifier = var.public_subnet_ids

  launch_template {
    id      = aws_launch_template.web_lt.id
    version = "$Latest"
  }

  health_check_type         = var.alb_target_group_arn != "" ? "ELB" : "EC2"
  health_check_grace_period = var.health_check_grace_period

  target_group_arns = var.alb_target_group_arn != "" ? [var.alb_target_group_arn] : null

  tag {
    key                 = "Name"
    value               = "${var.vpc_name}-web"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# NOTE: Removed aws_eip resource and any data/aws_instances usage to avoid runtime/provider mismatches.
# If you need instance-level IPs or IDs, query them outside this module (e.g., with a separate data resource
# after the ASG is created, or in a wrapper module that inspects instances).
