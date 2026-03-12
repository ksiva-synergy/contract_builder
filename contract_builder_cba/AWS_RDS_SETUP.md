# AWS RDS PostgreSQL Setup Guide

## Step 1: Create AWS RDS PostgreSQL Instance

### Using AWS Console:

1. **Navigate to RDS Dashboard**
   - Go to AWS Console → RDS → Create database

2. **Database Creation Method**
   - Choose: Standard create

3. **Engine Options**
   - Engine type: PostgreSQL
   - Version: PostgreSQL 15.x or later (recommended)

4. **Templates**
   - Choose: Free tier (for testing) or Production (for production)

5. **Settings**
   - DB instance identifier: `contract-builder-db`
   - Master username: `admin` (or your preferred username)
   - Master password: Create a strong password (save this!)

6. **Instance Configuration**
   - DB instance class: 
     - Free tier: db.t3.micro
     - Production: db.t3.small or larger

7. **Storage**
   - Storage type: General Purpose SSD (gp3)
   - Allocated storage: 20 GB (minimum)
   - Enable storage autoscaling (optional)

8. **Connectivity**
   - VPC: Default VPC (or your custom VPC)
   - Public access: Yes (for development) / No (for production with VPN)
   - VPC security group: Create new or use existing
   - Availability Zone: No preference

9. **Database Authentication**
   - Choose: Password authentication

10. **Additional Configuration**
    - Initial database name: `contractdb`
    - Backup retention: 7 days (recommended)
    - Enable encryption (recommended for production)

11. **Click "Create database"**
    - Wait 5-10 minutes for the instance to be created

## Step 2: Configure Security Group

1. **Navigate to EC2 → Security Groups**
2. **Find your RDS security group**
3. **Edit Inbound Rules**
   - Add rule:
     - Type: PostgreSQL
     - Protocol: TCP
     - Port: 5432
     - Source: 
       - Development: Your IP (My IP)
       - Production: Your application's security group or VPC CIDR

## Step 3: Get Connection Details

1. **Go to RDS Dashboard → Databases**
2. **Click on your database instance**
3. **Copy the Endpoint** (looks like: `your-db-instance.abc123.us-east-1.rds.amazonaws.com`)
4. **Note the Port** (default: 5432)

## Step 4: Configure Your Application

1. **Update `.env` file** with your RDS credentials:

```env
DATABASE_URL="postgresql://admin:YOUR_PASSWORD@your-db-instance.abc123.us-east-1.rds.amazonaws.com:5432/contractdb?schema=public"
```

Replace:
- `admin` → Your master username
- `YOUR_PASSWORD` → Your master password
- `your-db-instance.abc123.us-east-1.rds.amazonaws.com` → Your RDS endpoint
- `contractdb` → Your database name

2. **For production, add connection pooling:**

```env
DATABASE_URL="postgresql://admin:YOUR_PASSWORD@your-endpoint:5432/contractdb?schema=public&connection_limit=10&pool_timeout=20"
```

## Step 5: Initialize Database

Run these commands in your project directory:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name init
```

## Step 6: Test Connection

```bash
# Open Prisma Studio to verify connection
npx prisma studio
```

## Step 7: Seed Database (Optional)

Create a seed file to populate initial data:

```bash
# Create seed script
npx prisma db seed
```

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use AWS Secrets Manager** for production credentials
3. **Enable SSL/TLS** for database connections:
   ```env
   DATABASE_URL="postgresql://...?sslmode=require"
   ```
4. **Restrict security group** to only necessary IPs
5. **Enable RDS encryption** at rest
6. **Regular backups** - Configure automated backups
7. **Use IAM authentication** for enhanced security (optional)

## Monitoring

1. **CloudWatch Metrics** - Monitor CPU, memory, connections
2. **Enable Enhanced Monitoring** for detailed metrics
3. **Set up CloudWatch Alarms** for critical thresholds

## Cost Optimization

1. **Use Reserved Instances** for production (save up to 60%)
2. **Right-size your instance** based on actual usage
3. **Delete unused snapshots**
4. **Use Aurora Serverless** for variable workloads (alternative)

## Troubleshooting

### Cannot connect to database:
- Check security group rules
- Verify endpoint and port
- Ensure public accessibility is enabled (for development)
- Check VPC and subnet configuration

### Connection timeout:
- Verify network connectivity
- Check if RDS instance is running
- Review security group inbound rules

### Authentication failed:
- Double-check username and password
- Ensure no special characters need URL encoding in connection string

## Using AWS CLI (Alternative Setup)

```bash
aws rds create-db-instance \
  --db-instance-identifier contract-builder-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --db-name contractdb \
  --publicly-accessible \
  --backup-retention-period 7
```
