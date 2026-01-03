sudo su - ubuntu
sudo apt-get update
sudo apt-get install -y mysql-client
wget https://raw.githubusercontent.com/Jywong-03/FYP_NeuraSky/refs/heads/main/neuraskyDB.sql
mysql -h terraform-20260103082950934900000004.c3usy6aekpgz.ap-southeast-1.rds.amazonaws.com -u admin -p neurasky_db < neuraskyDB.sql
mysql -h terraform-20260102085117774500000003.c3usy6aekpgz.ap-southeast-1.rds.amazonaws.com -u admin -p neurasky_db
-- Check if tables exist
SHOW TABLES;
-- Check if data exists (e.g., check users table)
SELECT COUNT(\*) FROM auth_user;
-- Exit
EXIT;

sudo docker logs neurasky_backend
sudo docker ps -a
