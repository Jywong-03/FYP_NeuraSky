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
# Multi-AZ Bastion Host Deployment
###############################################

# Determine target subnets robustly:
# - If multi-AZ enabled, use public_subnet_ids (must be non-empty)
# - Else if public_subnet_ids provided and not empty, use first of them
# - Else if public_subnet_id was provided (old style), use that
locals {
  target_subnets = var.enable_multi_az ? var.public_subnet_ids : length(var.public_subnet_ids) > 0 ? [var.public_subnet_ids[0]] : (var.public_subnet_id != "" ? [var.public_subnet_id] : [])
}

resource "aws_instance" "bastion" {
  count                       = length(local.target_subnets)
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  subnet_id                   = local.target_subnets[count.index]
  key_name                    = var.key_name
  vpc_security_group_ids      = [var.bastion_sg_id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get upgrade -y
              apt-get install -y unzip curl git awscli openssh-server
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip awscliv2.zip
              sudo ./aws/install
              systemctl enable ssh
              systemctl start ssh
              echo "Welcome to DDAC Bastion Host (Ubuntu)" > /etc/motd
              EOF

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.vpc_name}-bastion-${count.index + 1}"
  }
}

###############################################
# Elastic IP per Bastion Host
###############################################
resource "aws_eip" "bastion_eip" {
  count    = var.assign_eip ? length(aws_instance.bastion) : 0
  instance = aws_instance.bastion[count.index].id
  domain   = "vpc"

  tags = {
    Name = "${var.vpc_name}-bastion-eip-${count.index + 1}"
  }
}
