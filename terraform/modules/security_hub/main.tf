data "aws_region" "current" {}

resource "aws_securityhub_account" "main" {}

# Enable "AWS Foundational Security Best Practices" standard
resource "aws_securityhub_standards_subscription" "fsbp" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/aws-foundational-security-best-practices/v/1.0.0"
}
