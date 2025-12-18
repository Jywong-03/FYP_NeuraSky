# -------------------------------
# VPC
# -------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
  }
}

# -------------------------------
# Public Subnets
# -------------------------------
resource "aws_subnet" "public" {
  for_each = { for subnet in var.public_subnets : subnet.name => subnet }

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = true

  tags = {
    Name = each.value.name
    Tier = "Public"
  }
}

# -------------------------------
# Private Subnets
# -------------------------------
resource "aws_subnet" "private" {
  for_each = { for subnet in var.private_subnets : subnet.name => subnet }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az

  tags = {
    Name = each.value.name
    Tier = "Private"
  }
}

# -------------------------------
# Internet Gateway
# -------------------------------
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.vpc_name}-igw"
  }
}

# -------------------------------
# Public Route Table
# -------------------------------
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.vpc_name}-public-rt"
  }
}

# -------------------------------
# Public Route Table Associations
# -------------------------------
resource "aws_route_table_association" "public_assoc" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public_rt.id
}

# -------------------------------
# NAT Gateway
# -------------------------------
resource "aws_eip" "nat_eip" {
  count  = var.enable_nat_gateway ? (var.enable_multi_nat ? length(var.public_subnets) : 1) : 0
  domain = "vpc"

  tags = {
    Name = "${var.vpc_name}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "nat_gw" {
  count = var.enable_nat_gateway ? (var.enable_multi_nat ? length(var.public_subnets) : 1) : 0

  allocation_id = aws_eip.nat_eip[count.index].id
  subnet_id     = var.enable_multi_nat ? element(values(aws_subnet.public)[*].id, count.index) : element(values(aws_subnet.public)[*].id, var.single_nat_index)

  depends_on = [aws_internet_gateway.igw]

  tags = {
    Name = "${var.vpc_name}-nat-gw-${count.index + 1}"
  }
}

# -------------------------------
# Private Route Tables
# -------------------------------
resource "aws_route_table" "private_rt" {
  count  = var.enable_nat_gateway ? length(var.private_subnets) : 0
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = var.enable_multi_nat ? element(aws_nat_gateway.nat_gw[*].id, count.index % length(aws_nat_gateway.nat_gw)) : aws_nat_gateway.nat_gw[0].id
  }

  tags = {
    Name = "${var.vpc_name}-private-rt-${count.index + 1}"
  }
}

# -------------------------------
# Private Route Table Associations
# -------------------------------
resource "aws_route_table_association" "private_assoc" {
  count          = var.enable_nat_gateway ? length(var.private_subnets) : 0
  subnet_id      = element(values(aws_subnet.private)[*].id, count.index)
  route_table_id = element(aws_route_table.private_rt[*].id, count.index)
}
