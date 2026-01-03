# IAM Role for SSM Access (Session Manager)
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# Launch Template
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_launch_template" "main" {
  name_prefix   = "${var.vpc_name}-lt-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    security_groups = [var.app_sg_id]
  }

  # Render User Data
  user_data = base64encode(templatefile("${path.module}/user_data.tftpl", {
    db_host     = var.db_address
    db_name     = var.db_name
    db_user     = var.db_username
    db_password = var.db_password
    secret_key  = var.secret_key

    alb_dns_name = var.alb_dns_name
    domain_name  = var.domain_name

    aws_ses_user     = var.aws_ses_user
    aws_ses_password = var.aws_ses_password
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name    = "${var.vpc_name}-web-instance"
      Project = var.project_name
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "main" {
  name                = "${var.vpc_name}-asg"
  vpc_zone_identifier = var.private_subnet_ids
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }

  target_group_arns = [var.frontend_tg_arn, var.backend_tg_arn]

  health_check_type         = "ELB"
  health_check_grace_period = 600 # 10 Minutes for Docker Build/Pull

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.vpc_name}-web-asg"
    propagate_at_launch = true
  }
}
