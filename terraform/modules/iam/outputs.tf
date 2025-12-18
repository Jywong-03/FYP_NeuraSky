############################################################
# Outputs — IAM Module
############################################################

output "role_name" {
  description = "The IAM role name (created or referenced)."
  value       = var.manage_role ? aws_iam_role.this[0].name : data.aws_iam_role.external[0].name
}

output "role_arn" {
  description = "The IAM role ARN (created or referenced)."
  value       = var.manage_role ? aws_iam_role.this[0].arn : data.aws_iam_role.external[0].arn
}

output "instance_profile_name" {
  description = "The instance profile name (created or referenced)."
  value       = var.manage_role ? aws_iam_instance_profile.this[0].name : data.aws_iam_instance_profile.external[0].name
}

# output "autoscaling_slr_service_name" {
#   description = "The service name for the Auto Scaling service-linked role (autoscaling.amazonaws.com)."
#   value       = var.manage_role ? aws_iam_service_linked_role.autoscaling[0].aws_service_name : ""
#   sensitive   = false
# }

