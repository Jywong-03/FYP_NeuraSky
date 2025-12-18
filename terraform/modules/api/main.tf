###############################################
# Fetch Latest Ubuntu 22.04 LTS AMI
###############################################
data "aws_ami" "ubuntu" {
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

###############################################
# API Server Launch Template
###############################################
resource "aws_launch_template" "api_lt" {
  name_prefix   = "${var.vpc_name}-api-lt-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = var.iam_instance_profile_name
  }

  network_interfaces {
    security_groups             = [var.api_sg_id]
    associate_public_ip_address = false # IMPORTANT: Keep this false for private
  }

  # Updated User Data
  user_data = base64encode(<<-EOF
  #!/bin/bash
    apt-get update -y
    apt-get upgrade -y
    # Install Docker & AWS CLI
    apt-get install -y docker.io awscli jq unzip
    systemctl start docker
    systemctl enable docker
    
    # Install AWS CLI v2
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install

    # 1. FETCH DATABASE SECRETS (From Secrets Manager)
    SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id ${var.db_secret_name} --query SecretString --output text --region ap-southeast-1)
    
    export DB_HOST=$(echo $SECRET_JSON | jq -r .host)
    export DB_USER=$(echo $SECRET_JSON | jq -r .username)
    export DB_PASS=$(echo $SECRET_JSON | jq -r .password)
    export DB_NAME=$(echo $SECRET_JSON | jq -r .dbname)
    export DB_PORT=$(echo $SECRET_JSON | jq -r .port)

    # 2. CONSTRUCT .NET Connection string
    CONN_STRING="Server=$DB_HOST;Database=$DB_NAME;User=$DB_USER;Password=$DB_PASS;"

    # 3. RUN BACKEND CONTAINER
    # Replace 'peekachiu/ddac-backend:latest' with your real image
    docker run -d \
      --restart always \
      --name backend-app \
      -p 5000:80 \
      -e ConnectionStrings__DefaultConnection=$CONN_STRING \
      -e ASPNETCORE_ENVIRONMENT=Production \
      -e DB_HOST=$DB_HOST \
      -e DB_USER=$DB_USER \
      -e DB_PASS=$DB_PASS \
      -e DB_NAME=$DB_NAME \
      -e DB_PORT=$DB_PORT \
      --log-driver=awslogs \
      --log-opt awslogs-region=ap-southeast-1 \
      --log-opt awslogs-group=${var.log_group_name} \
      --log-opt awslogs-stream=api-instance-$(hostname) \
      peekachiu/ddac-backend:Production
      
    echo "Backend Container Started!" > /etc/motd
    EOF
  )

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
    tags = {
      Name = "${var.vpc_name}-api"
    }
  }
}

###############################################
# API Server Auto Scaling Group
###############################################
resource "aws_autoscaling_group" "api_asg" {
  name             = "${var.vpc_name}-api-asg"
  desired_capacity = var.asg_desired_capacity
  max_size         = var.asg_max_size
  min_size         = var.asg_min_size

  # Deploy across all private subnets provided
  vpc_zone_identifier = var.private_subnet_ids

  launch_template {
    id      = aws_launch_template.api_lt.id
    version = "$Latest"
  }

  # Use the ALB health check
  health_check_type         = "ELB"
  health_check_grace_period = 300 // Wait 5 mins for instance to be healthy

  # Auto-attach to the internal ALB target group
  target_group_arns = var.alb_target_group_arn != "" ? [var.alb_target_group_arn] : []

  tag {
    key                 = "Name"
    value               = "${var.vpc_name}-api"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}