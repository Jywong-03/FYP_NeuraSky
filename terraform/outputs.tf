output "database_endpoint" {
  description = "The endpoint of the RDS database"
  value       = aws_db_instance.default.endpoint
}

output "server_public_ip" {
  description = "The public IP of the Django server"
  value       = aws_instance.app_server.public_ip
}
