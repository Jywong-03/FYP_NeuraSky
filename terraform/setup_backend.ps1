$bucketName = "neurasky-fyp-terraform-state"
$tableName = "neurasky-terraform-locks"
$region = "ap-southeast-1"

Write-Host "Setting up Terraform Remote State Infrastructure..."

# Create S3 Bucket
Write-Host "Creating S3 Bucket: $bucketName"
aws s3api create-bucket --bucket $bucketName --region $region --create-bucket-configuration LocationConstraint=$region
aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Enabled

# Create DynamoDB Table
Write-Host "Creating DynamoDB Table: $tableName"
aws dynamodb create-table `
    --table-name $tableName `
    --attribute-definitions AttributeName=LockID, AttributeType=S `
    --key-schema AttributeName=LockID, KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=1, WriteCapacityUnits=1 `
    --region $region

Write-Host "Done! You can now run 'terraform init' in the terraform directory."
