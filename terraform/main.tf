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
  region = "ap-southeast-1"
}

# ... (rest of the file)



# 1. Create a Virtual Private Cloud (VPC) - The network for your app
resource "aws_vpc" "neurasky_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "neurasky-vpc" }
}

# 2. Create a Subnet - A section of the VPC where servers live
resource "aws_subnet" "neurasky_subnet" {
  vpc_id            = aws_vpc.neurasky_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-southeast-1a"
  tags              = { Name = "neurasky-subnet" }
}

resource "aws_subnet" "neurasky_subnet_b" {
  vpc_id            = aws_vpc.neurasky_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-southeast-1b"
  tags              = { Name = "neurasky-subnet-b" }
}

# 3. Create an Internet Gateway - So your server can talk to the internet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.neurasky_vpc.id
}

# Route table to connect Subnet to Gateway
resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.neurasky_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.neurasky_subnet.id
  route_table_id = aws_route_table.rt.id
}


# Security Group to allow traffic to the Database
resource "aws_security_group" "db_sg" {
  name        = "neurasky-db-sg"
  description = "Allow DB access"
  vpc_id      = aws_vpc.neurasky_vpc.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Only allow access from inside the VPC
  }
}

# The MySQL Database Instance
resource "aws_db_instance" "default" {
  allocated_storage      = 10
  db_name                = "neurasky_db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"         # Free tier eligible
  username               = "admin"               # You will put this in your .env later
  password               = "neuraskypassword123" # In production, use Terraform variables/Secrets Manager!
  parameter_group_name   = "default.mysql8.0"
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
}

# Subnet group for RDS
resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = [aws_subnet.neurasky_subnet.id, aws_subnet.neurasky_subnet_b.id] # RDS needs 2 subnets usually
}
# Note: You need a second subnet in a different AZ for RDS, create "neurasky_subnet_b" similar to Step 2


# Security Group for the Django Server
resource "aws_security_group" "web_sg" {
  name   = "neurasky-web-sg"
  vpc_id = aws_vpc.neurasky_vpc.id

  # Allow HTTP traffic (Port 80)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH traffic (Port 22) - to login and fix things
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound internet access (to install pip packages)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Get the latest Ubuntu 22.04 AMI for the current region
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

# The EC2 Instance
resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.neurasky_subnet.id
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  associate_public_ip_address = true

  # This script runs when the server turns on for the first time
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

              # 3. Create .env file for Backend (Injecting Terraform variables)
              # Note: In production, pass these securely!
              echo "DB_HOST=${aws_db_instance.default.address}" >> backend_neurasky/.env
              echo "DB_PORT=3306" >> backend_neurasky/.env
              echo "DB_NAME=neurasky_db" >> backend_neurasky/.env
              echo "DB_USER=admin" >> backend_neurasky/.env
              echo "DB_PASSWORD=neuraskypassword123" >> backend_neurasky/.env
              # Add other env vars here as needed

              # 4. Start Application
              docker compose up -d --build
              EOF

  tags = {
    Name = "NeuraSky-Backend"
  }
}
