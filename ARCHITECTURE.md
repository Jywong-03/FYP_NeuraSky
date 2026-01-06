# ☁️ Cloud Architecture - NeuraSky

This document outlines the high-level architecture of the NeuraSky infrastructure deployed on AWS using Terraform.

## 📐 Architecture Diagram

```mermaid
graph TD
    User([👤 User])
    CF[⚡ CloudFront CDN]
    WAF[🛡️ AWS WAF*]
    ALB[⚖️ Application Load Balancer]

    subgraph VPC [☁️ VPC (NeuraSky)]
        subgraph PublicSubnets [Public Subnets]
            NAT[NAT Gateway]
            IGW[Internet Gateway]
        end

        subgraph PrivateSubnets [Private Subnets (Multi-AZ)]
            ASG[⚙️ Auto Scaling Group (Spot)]
            EC2_1[Instance 1]
            EC2_2[Instance 2]
            S3VPC[S3 VPC Endpoint]
        end

        subgraph DataLayer [Data & Storage]
            RDS[(🗄️ RDS MySQL)]
            S3[📦 S3 Buckets (Logs)]
        end
    end

    %% Traffic Flow
    User -->|HTTPS| CF
    CF --> ALB
    ALB -->|HTTP:3000| ASG
    ASG -->|SQL:3306| RDS
    ASG -->|Internal| S3VPC --> S3

    %% Monitoring Loop
    CW[👁️ CloudWatch] -.->|Monitors| ASG
    CW -.->|Monitors| ALB
    CW -.->|Alerts| Email([📧 Admin])

    %% Cost Control
    Budget[💰 AWS Budget] -.->|Alerts > $5| Email

    style User fill:#f9f,stroke:#333
    style CF fill:#ff9900,stroke:#333
    style ASG fill:#1ec918,stroke:#333
    style RDS fill:#3b48cc,stroke:#fff,color:#fff
```

_\*WAF is architecture-ready but currently disabled for cost savings._

## 🧩 Component Breakdown

| Component         | Service    | Role                    | Key Feature                                     |
| :---------------- | :--------- | :---------------------- | :---------------------------------------------- |
| **Edge**          | CloudFront | Global Content Delivery | Caches static assets, provides DDoS protection. |
| **Load Balancer** | ALB        | Traffic Distribution    | Routes traffic to healthy instances across AZs. |
| **Compute**       | EC2 Spot   | Application Host        | Runs Docker containers at ~90% discount.        |
| **Database**      | RDS        | Relational Data         | Managed MySQL with automated backups.           |
| **Monitoring**    | CloudWatch | Observability           | Visual Dashboard and Alarms for health.         |
| **Security**      | SSM        | Secrets & Access        | Stores credentials and manages SSH-less access. |
