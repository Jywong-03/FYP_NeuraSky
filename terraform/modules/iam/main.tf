############################################################
# IAM Module (Reusable)
# Supports two modes:
#  - manage_role = true  → Terraform creates IAM role, policy, and instance profile
#  - manage_role = false → Terraform uses pre-existing role/profile via data sources
############################################################

data "aws_partition" "current" {}
data "aws_caller_identity" "current" {}

locals {
  s3_resources = length(var.s3_buckets) > 0 ? concat(
    [for b in var.s3_buckets : "arn:${data.aws_partition.current.partition}:s3:::${b}"],
    [for b in var.s3_buckets : "arn:${data.aws_partition.current.partition}:s3:::${b}/*"]
  ) : ["arn:${data.aws_partition.current.partition}:s3:::*"]
}

# ------------------------------------------------------------
# Creation path (if manage_role = true)
# ------------------------------------------------------------
resource "aws_iam_role" "this" {
  count = var.manage_role ? 1 : 0

  name = var.role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "ec2.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    Name    = var.role_name
    Project = var.project
  }
}

resource "aws_iam_policy" "custom" {
  count       = var.manage_role ? 1 : 0
  name        = "${var.role_name}-policy"
  description = "Custom IAM policy for ${var.role_name}"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "*"
      },
      {
        Effect   = "Allow",
        Action   = ["s3:GetObject", "s3:ListBucket"],
        Resource = local.s3_resources
      },
      {
        Effect   = "Allow",
        Action   = ["ssm:GetParameter", "ssm:GetParameters"],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_custom" {
  count      = var.manage_role ? 1 : 0
  role       = aws_iam_role.this[0].name
  policy_arn = aws_iam_policy.custom[0].arn
}

resource "aws_iam_instance_profile" "this" {
  count = var.manage_role ? 1 : 0
  name  = var.instance_profile_name
  role  = aws_iam_role.this[0].name
}

# ------------------------------------------------------------
# External path (if manage_role = false)
# ------------------------------------------------------------
data "aws_iam_role" "external" {
  count = var.manage_role ? 0 : 1
  name  = var.role_name
}

data "aws_iam_instance_profile" "external" {
  count = var.manage_role ? 0 : 1
  name  = var.instance_profile_name
}

# Ensure Auto Scaling's service-linked role exists when manage_role = true
# resource "aws_iam_service_linked_role" "autoscaling" {
#   count            = var.manage_role ? 1 : 0
#   aws_service_name = "autoscaling.amazonaws.com"
#   description      = "Service-linked role for AWS Auto Scaling used by DDAC Auto Scaling Groups"
# }

