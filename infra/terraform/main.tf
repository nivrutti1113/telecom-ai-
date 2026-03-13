provider "aws" {
  region = "us-east-1"
}

# Telecom AI VPC
resource "aws_vpc" "telecom_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "telecom-ai-platform-vpc"
  }
}

# EKS Cluster for Microservices
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "telecom-ai-cluster"
  cluster_version = "1.27"

  vpc_id     = aws_vpc.telecom_vpc.id
  subnet_ids = ["subnet-abc12345", "subnet-def67890"] # Placeholder subnets

  eks_managed_node_groups = {
    general = {
      min_size     = 2
      max_size     = 5
      desired_size = 3
      instance_types = ["t3.xlarge"]
    }
    ml_compute = {
      min_size     = 1
      max_size     = 3
      desired_size = 1
      instance_types = ["p3.2xlarge"] # GPU instances for ML training
    }
  }
}

# TimescaleDB on RDS (PostgreSQL with Timescale Extension)
resource "aws_db_instance" "telecom_db" {
  allocated_storage    = 100
  engine               = "postgres"
  engine_version       = "14.7"
  instance_class       = "db.t3.large"
  name                 = "telecom_analytics"
  username             = "admin"
  password             = "supersecurepassword"
  publicly_accessible  = false
  skip_final_snapshot  = true
}

# Managed Kafka (MSK)
resource "aws_msk_cluster" "telecom_kafka" {
  cluster_name           = "telecom-telemetry-stream"
  kafka_version          = "2.8.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = ["subnet-abc12345", "subnet-def67890"]
    security_groups = ["sg-12345678"]
  }
}
