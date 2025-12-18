# =====================================
# SECURITY GROUP CONFIGURATION MODULE
# =====================================

############################################################
# 1. Public Web Security Group
# ----------------------------------------------------------
# - Allows HTTP/HTTPS from internet
# - Allows SSH only from admin IP (optional)
############################################################
resource "aws_security_group" "web_sg" {
  name        = "${var.vpc_name}-web-sg"
  description = "Allow HTTP, HTTPS, and restricted SSH"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow HTTP traffic from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS traffic from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.enable_web_ssh ? [1] : []
    content {
      description = "SSH access from admin IP"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.admin_ip]
    }
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-web-sg"
  }
}

############################################################
# 2. API (Private) Security Group
# ----------------------------------------------------------
# - Allows traffic from web servers only (port 5000 by default)
# - Denies all other inbound traffic
############################################################
resource "aws_security_group" "api_sg" {
  name        = "${var.vpc_name}-api-sg"
  description = "Allow API access from web servers only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow API traffic from Web SG"
    from_port       = var.api_port
    to_port         = var.api_port
    protocol        = "tcp"
    security_groups = [aws_security_group.api_lb_sg.id]
  }

  ingress {
    description     = "Allow SSH from Bastion Host"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-api-sg"
  }
}

############################################################
# 3. Database Security Group
# ----------------------------------------------------------
# - Allows database access from API SG only (port 3306 default)
############################################################
resource "aws_security_group" "db_sg" {
  name        = "${var.vpc_name}-db-sg"
  description = "Allow DB access from API SG only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow database connection from API SG"
    from_port       = var.db_port
    to_port         = var.db_port
    protocol        = "tcp"
    security_groups = [aws_security_group.api_sg.id]
  }

  ingress {
    description     = "Allow SSH from Bastion Host"
    from_port       = var.db_port
    to_port         = var.db_port
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-db-sg"
  }
}

############################################################
# 4. Bastion Host Security Group
# ----------------------------------------------------------
# - Allows SSH from admin IP
# - Can reach all private instances (for maintenance)
############################################################
resource "aws_security_group" "bastion_sg" {
  name        = "${var.vpc_name}-bastion-sg"
  description = "Allow SSH from admin IP only"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH access from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-bastion-sg"
  }
}

############################################################
# 5. External Load Balancer Security Group
# ----------------------------------------------------------
# - Allows HTTP/HTTPS from anywhere
# - Allows outbound to web servers only
############################################################
resource "aws_security_group" "lb_sg" {
  name        = "${var.vpc_name}-lb-sg"
  description = "Security group for Load Balancer - allows public HTTP/HTTPS"
  vpc_id      = var.vpc_id

  # Allow HTTP from anywhere
  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS from anywhere
  ingress {
    description = "Allow HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound only to web servers (HTTP)
  egress {
    description     = "Allow traffic to Web Servers"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  # Optional: Allow health checks and internal ALB traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-lb-sg"
  }
}

############################################################
# 6. Internal API Load Balancer Security Group
# ----------------------------------------------------------
# - Allows traffic from Web SG (port 5000)
# - Allows traffic to API SG (port 5000)
############################################################
resource "aws_security_group" "api_lb_sg" {
  name        = "${var.vpc_name}-api-lb-sg"
  description = "Allow traffic from Web SG to Internal API-ALB"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow API traffic from Web SG"
    from_port       = var.api_port # 5000
    to_port         = var.api_port # 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  egress {
    description = "Allow traffic to API Servers"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.vpc_name}-api-lb-sg"
  }
}