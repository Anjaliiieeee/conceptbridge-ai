# ConceptBridge AI — AWS Cloud Architecture & Deployment Guide

This document outlines the production cloud deployment strategy for **ConceptBridge AI**, detailing compute hosting, relational data persistence, object storage, and event-driven serverless extensions.

---

## Architecture Overview

```
                      ┌──────────────────────────────┐
                      │    Route 53 DNS + ACM SSL    │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    CloudFront CDN / S3       │ (Frontend React SPA)
                      └──────────────┬───────────────┘
                                     │ /api/*
                                     ▼
                      ┌──────────────────────────────┐
                      │   Application Load Balancer  │
                      └──────────────┬───────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼                                             ▼
  ┌───────────────────────┐                     ┌───────────────────────┐
  │  EC2 / ECS Backend 1  │                     │  EC2 / ECS Backend 2  │
  │ (FastAPI + Gunicorn)  │                     │ (FastAPI + Gunicorn)  │
  └───────────┬───────────┘                     └───────────┬───────────┘
              │                                             │
              └──────────────────────┬──────────────────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
      ┌─────────────────────┐ ┌─────────────┐ ┌─────────────────────┐
      │   AWS RDS Postgres  │ │ ElastiCache │ │       AWS S3        │
      │  (Primary + Read)   │ │   (Redis)   │ │  (Artifacts / Logs) │
      └─────────────────────┘ └─────────────┘ └─────────────────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │     AWS Lambda      │ (Batch diagnostics / Weekly reports)
      └─────────────────────┘
```

---

## 1. AWS EC2 Backend Deployment

### Instance Recommendation
- **Instance Type**: `t3.medium` or `c6i.large` (production)
- **OS**: Ubuntu 24.04 LTS
- **Security Group**:
  - Inbound: Port 80 (HTTP), 443 (HTTPS), 22 (SSH from bastion host only)
  - Outbound: All traffic

### Systemd Service Configuration
Create `/etc/systemd/system/conceptbridge.service`:

```ini
[Unit]
Description=ConceptBridge AI FastAPI Application
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/conceptbridge/backend
Environment="PATH=/var/www/conceptbridge/backend/venv/bin"
EnvironmentFile=/etc/conceptbridge.env
ExecStart=/var/www/conceptbridge/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable conceptbridge
sudo systemctl start conceptbridge
```

### Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/conceptbridge`:

```nginx
server {
    listen 80;
    server_name api.conceptbridge.ai;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable SSL using Let's Encrypt / Certbot:
```bash
sudo certbot --nginx -d api.conceptbridge.ai
```

---

## 2. AWS RDS (PostgreSQL)

1. Provision an **Amazon RDS for PostgreSQL** (db.t4g.medium or Multi-AZ for high availability).
2. Configure VPC Security Group to only accept port 5432 ingress from the EC2 backend security group.
3. Configure backend `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql+psycopg2://<user>:<password>@<rds-endpoint>:5432/conceptbridge"
   ```
4. Run migrations from CI/CD pipeline or deployment host:
   ```bash
   alembic upgrade head
   ```

---

## 3. AWS S3 File Storage

ConceptBridge AI stores static problem assets, student submission snapshots, and diagnostic report PDFs in Amazon S3:

### Bucket Architecture
- `conceptbridge-production-assets`: Public cached assets (diagrams, subject icons)
- `conceptbridge-production-submissions`: Private encrypted bucket with SSE-KMS for student submission snapshots and diagnostic exports.

### Python Boto3 Integration Utility
```python
import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client("s3", region_name="us-east-1")

def upload_submission_archive(user_id: int, submission_id: int, code_text: str):
    key = f"users/{user_id}/submissions/{submission_id}/solution.txt"
    s3_client.put_object(
        Bucket="conceptbridge-production-submissions",
        Key=key,
        Body=code_text.encode("utf-8"),
        ContentType="text/plain",
        ServerSideEncryption="aws:kms",
    )
```

---

## 4. AWS Lambda for Serverless Batch Diagnostics

For heavy batch operations—such as calculating weekly learning summaries, generating personalized diagnostic digest emails, or retraining evaluation heuristics—AWS Lambda runs event-driven tasks triggered by Amazon EventBridge or SQS:

### Lambda Function Architecture
```python
import json
from app.services.progress_service import ProgressService
from app.core.database import SessionLocal

def lambda_handler(event, context):
    """EventBridge cron trigger running weekly diagnostic synthesis."""
    db = SessionLocal()
    try:
        progress_service = ProgressService(db)
        # Synthesize active student gaps and generate study plans
        return {"statusCode": 200, "body": json.dumps("Weekly diagnostic completed.")}
    finally:
        db.close()
```

---

## 5. Security & Secrets Management

- **Zero Plaintext Secrets**: Store `SECRET_KEY`, `OPENAI_API_KEY`, and `DATABASE_URL` in **AWS Secrets Manager** or **AWS Systems Manager Parameter Store**.
- **IAM Least Privilege**: Attach an IAM Instance Profile to EC2 with scoped permissions for S3 bucket read/write and Secrets Manager read.
- **WAF Protection**: Position **AWS WAF** in front of CloudFront / ALB to mitigate DDoS and SQL injection attempts.
