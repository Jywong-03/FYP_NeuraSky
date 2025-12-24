output "db_address" {
  value = aws_db_instance.default.address
}

output "db_endpoint" {
  value = aws_db_instance.default.endpoint
}
