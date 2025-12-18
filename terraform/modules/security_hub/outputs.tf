output "security_hub_id" {
  description = "The ID of the Security Hub account resource"
  value       = aws_securityhub_account.main.id
}
