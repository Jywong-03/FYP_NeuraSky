# =====================================
# SECURITY GROUP OUTPUTS
# =====================================

# -------------------------------
# 3. Database Security Group
# -------------------------------
output "db_sg_id" {
  description = "ID of the database security group"
  value       = aws_security_group.db_sg.id
}

# -------------------------------
# 4. Bastion Host Security Group
# -------------------------------
output "bastion_sg_id" {
  description = "ID of the bastion host security group"
  value       = aws_security_group.bastion_sg.id
}

# -------------------------------
# 5. Web Server Security Group
# -------------------------------
output "web_sg_id" {
  description = "ID of the web server security group"
  value       = aws_security_group.web_sg.id
}

# -------------------------------
# 6. API Server Security Group
# -------------------------------
output "api_sg_id" {
  description = "ID of the API server security group"
  value       = aws_security_group.api_sg.id
}

# -------------------------------
# Load Balancer Security Group
# -------------------------------
output "lb_sg_id" {
  description = "ID of the Load Balancer security group"
  value       = aws_security_group.lb_sg.id
}

output "api_lb_sg_id" {
  description = "ID of the Internal API Load Balancer security group"
  value       = aws_security_group.api_lb_sg.id
}