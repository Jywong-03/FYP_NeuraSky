###########################################################
# 1. DB SUBNET GROUP
# This tells RDS which of your private subnets it can use.
###########################################################
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = lower("${var.vpc_name}-db-subnet-group")
  subnet_ids = var.private_subnet_ids

  tags = {
    name = lower("${var.vpc_name}-db-subnet-group")
  }
}

###########################################################
# 2. RDS DATABASE INSTANCE (MSSQL)
# This creates the Multi-AZ (master/slave) database.
###########################################################
resource "aws_db_instance" "db_instance" {
  identifier     = lower("${var.vpc_name}-db")
  engine         = "mysql"        # SQL Server Express Edition
  engine_version = "8.0"          # SQL Server 2019
  instance_class = "db.t3.medium" # Upgraded for performance

  allocated_storage = 20 # 20 GB of storage
  storage_type      = "gp3"

  # --- Credentials ---
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # --- High Availability (Your "master/slave" requirement) ---
  multi_az = true

  # --- Security & Networking ---
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [var.db_sg_id]
  publicly_accessible    = false # Kept secure in private subnets
  port                   = 3306  # MySQL default port

  # --- Backup & Maintenance ---
  backup_retention_period = 7
  skip_final_snapshot     = true # Set to false for production

  tags = {
    Name    = "${var.vpc_name}-db"
    Project = var.project_name
  }
}