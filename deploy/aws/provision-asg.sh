#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech AWS Infrastructure Provisioning Script (Auto Scaling + ALB)
# Automates the setup of:
# 1. VPC Subnet Discovery & Security Groups
# 2. Target Group with /api/health check
# 3. Application Load Balancer (ALB)
# 4. EC2 Launch Template (with base64 User-Data)
# 5. Auto Scaling Group (Min: 1, Max: 2, Desired: 1)
# 6. Target Tracking Scaling Policy (CPU > 70%)
# ==============================================================================

set -euo pipefail

# Configuration Variables
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="mindvisiontech"
VPC_ID="${VPC_ID:-}" # Will auto-detect default VPC if empty
KEY_NAME="${KEY_NAME:-mindvisiontech-key}"
AMI_ID="${AMI_ID:-}" # Base Ubuntu 22.04 or your Golden AMI ID

echo "======================================================================"
echo " Starting Auto Scaling & Load Balancer Provisioning for ${PROJECT_NAME}"
echo " Region: ${AWS_REGION}"
echo "======================================================================"

# 1. Auto-detect default VPC and Subnets if not provided
if [ -z "${VPC_ID}" ]; then
    echo "--> [1/6] Auto-detecting default VPC..."
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region "${AWS_REGION}" --query "Vpcs[0].VpcId" --output text)
    echo "Using Default VPC: ${VPC_ID}"
fi

if [ -z "${SUBNET_1:-}" ] || [ -z "${SUBNET_2:-}" ]; then
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --region "${AWS_REGION}" --query "Subnets[0:2].SubnetId" --output text)
    SUBNET_1=$(echo "${SUBNET_IDS}" | awk '{print $1}')
    SUBNET_2=$(echo "${SUBNET_IDS}" | awk '{print $2}')
fi
echo "Using Subnets: ${SUBNET_1}, ${SUBNET_2}"

# 2. Create Security Groups
echo "--> [2/6] Creating Security Groups..."
ALB_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=${PROJECT_NAME}-alb-sg" "Name=vpc-id,Values=${VPC_ID}" --region "${AWS_REGION}" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || true)

if [ "${ALB_SG_ID}" == "None" ] || [ -z "${ALB_SG_ID}" ]; then
    ALB_SG_ID=$(aws ec2 create-security-group \
        --group-name "${PROJECT_NAME}-alb-sg" \
        --description "Security Group for ${PROJECT_NAME} Application Load Balancer" \
        --vpc-id "${VPC_ID}" \
        --region "${AWS_REGION}" \
        --output text --query 'GroupId')

    aws ec2 authorize-security-group-ingress --group-id "${ALB_SG_ID}" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "${AWS_REGION}"
    aws ec2 authorize-security-group-ingress --group-id "${ALB_SG_ID}" --protocol tcp --port 443 --cidr 0.0.0.0/0 --region "${AWS_REGION}"
    echo "Created ALB Security Group: ${ALB_SG_ID}"
else
    echo "ALB Security Group exists: ${ALB_SG_ID}"
fi

EC2_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=${PROJECT_NAME}-ec2-sg" "Name=vpc-id,Values=${VPC_ID}" --region "${AWS_REGION}" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || true)

if [ "${EC2_SG_ID}" == "None" ] || [ -z "${EC2_SG_ID}" ]; then
    EC2_SG_ID=$(aws ec2 create-security-group \
        --group-name "${PROJECT_NAME}-ec2-sg" \
        --description "Security Group for ${PROJECT_NAME} EC2 Workers" \
        --vpc-id "${VPC_ID}" \
        --region "${AWS_REGION}" \
        --output text --query 'GroupId')

    # Allow port 80 & 443 only from the ALB Security Group
    aws ec2 authorize-security-group-ingress --group-id "${EC2_SG_ID}" --protocol tcp --port 80 --source-group "${ALB_SG_ID}" --region "${AWS_REGION}"
    aws ec2 authorize-security-group-ingress --group-id "${EC2_SG_ID}" --protocol tcp --port 443 --source-group "${ALB_SG_ID}" --region "${AWS_REGION}"
    aws ec2 authorize-security-group-ingress --group-id "${EC2_SG_ID}" --protocol tcp --port 22 --cidr 0.0.0.0/0 --region "${AWS_REGION}"
    echo "Created EC2 Security Group: ${EC2_SG_ID}"
else
    echo "EC2 Security Group exists: ${EC2_SG_ID}"
fi

# 3. Create Target Group
echo "--> [3/6] Creating Target Group with /api/health check..."
TG_ARN=$(aws elbv2 describe-target-groups --names "${PROJECT_NAME}-tg" --region "${AWS_REGION}" --query "TargetGroups[0].TargetGroupArn" --output text 2>/dev/null || true)

if [ "${TG_ARN}" == "None" ] || [ -z "${TG_ARN}" ]; then
    TG_ARN=$(aws elbv2 create-target-group \
        --name "${PROJECT_NAME}-tg" \
        --protocol HTTP \
        --port 80 \
        --vpc-id "${VPC_ID}" \
        --health-check-path "/api/health" \
        --health-check-interval-seconds 30 \
        --health-check-timeout-seconds 5 \
        --healthy-threshold-count 2 \
        --unhealthy-threshold-count 3 \
        --target-type instance \
        --region "${AWS_REGION}" \
        --query "TargetGroups[0].TargetGroupArn" \
        --output text)
    echo "Created Target Group: ${TG_ARN}"
else
    echo "Target Group exists: ${TG_ARN}"
fi

# 4. Create Application Load Balancer (ALB)
echo "--> [4/6] Provisioning Application Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names "${PROJECT_NAME}-alb" --region "${AWS_REGION}" --query "LoadBalancers[0].LoadBalancerArn" --output text 2>/dev/null || true)

if [ "${ALB_ARN}" == "None" ] || [ -z "${ALB_ARN}" ]; then
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name "${PROJECT_NAME}-alb" \
        --subnets "${SUBNET_1}" "${SUBNET_2}" \
        --security-groups "${ALB_SG_ID}" \
        --scheme internet-facing \
        --type application \
        --ip-address-type ipv4 \
        --region "${AWS_REGION}" \
        --query "LoadBalancers[0].LoadBalancerArn" \
        --output text)

    echo "Created ALB: ${ALB_ARN}"

    # Default HTTP listener forwarding to Target Group
    aws elbv2 create-listener \
        --load-balancer-arn "${ALB_ARN}" \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn="${TG_ARN}" \
        --region "${AWS_REGION}"
else
    echo "ALB exists: ${ALB_ARN}"
fi

# 5. Create Launch Template
echo "--> [5/6] Creating EC2 Launch Template..."
if [ -z "${AMI_ID}" ]; then
    # Auto-resolve latest Ubuntu 22.04 LTS AMI in the region
    AMI_ID=$(aws ssm get-parameter \
        --name /aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id \
        --region "${AWS_REGION}" \
        --query "Parameter.Value" \
        --output text)
    echo "Auto-detected Ubuntu 22.04 AMI: ${AMI_ID}"
fi

USER_DATA_B64=$(base64 -w 0 "$(dirname "$0")/user-data.sh")

# Prepare launch template data
cat << EOF > /tmp/lt-data.json
{
  "ImageId": "${AMI_ID}",
  "InstanceType": "t3.micro",
  "SecurityGroupIds": ["${EC2_SG_ID}"],
  "UserData": "${USER_DATA_B64}",
  "BlockDeviceMappings": [
    {
      "DeviceName": "/dev/sda1",
      "Ebs": {
        "VolumeSize": 20,
        "VolumeType": "gp3",
        "DeleteOnTermination": true,
        "Encrypted": true
      }
    }
  ],
  "TagSpecifications": [
    {
      "ResourceType": "instance",
      "Tags": [
        {"Key": "Name", "Value": "${PROJECT_NAME}-asg-node"},
        {"Key": "Environment", "Value": "production"}
      ]
    }
  ]
}
EOF

# Create or Update Launch Template
aws ec2 delete-launch-template --launch-template-name "${PROJECT_NAME}-lt" --region "${AWS_REGION}" 2>/dev/null || true
aws ec2 create-launch-template \
    --launch-template-name "${PROJECT_NAME}-lt" \
    --version-description "v1" \
    --launch-template-data file:///tmp/lt-data.json \
    --region "${AWS_REGION}"
rm -f /tmp/lt-data.json
echo "Launch Template created: ${PROJECT_NAME}-lt"

# 6. Create Auto Scaling Group
echo "--> [6/6] Creating Auto Scaling Group..."
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "${PROJECT_NAME}-asg" --force-delete --region "${AWS_REGION}" 2>/dev/null || true

aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name "${PROJECT_NAME}-asg" \
    --launch-template "LaunchTemplateName=${PROJECT_NAME}-lt,Version=\$Latest" \
    --min-size 1 \
    --max-size 2 \
    --desired-capacity 1 \
    --target-group-arns "${TG_ARN}" \
    --vpc-zone-identifier "${SUBNET_1},${SUBNET_2}" \
    --health-check-type "ELB" \
    --health-check-grace-period 180 \
    --region "${AWS_REGION}"

# Add Target Tracking Scaling Policy (CPU > 70%)
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name "${PROJECT_NAME}-asg" \
    --policy-name "${PROJECT_NAME}-cpu-target-70" \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration '{
        "PredefinedMetricSpecification": {
            "PredefinedMetricType": "ASGAverageCPUUtilization"
        },
        "TargetValue": 70.0
    }' \
    --region "${AWS_REGION}"

ALB_DNS=$(aws elbv2 describe-load-balancers --names "${PROJECT_NAME}-alb" --region "${AWS_REGION}" --query "LoadBalancers[0].DNSName" --output text)

echo "======================================================================"
echo " PROVISIONING COMPLETE!"
echo " ALB DNS: http://${ALB_DNS}"
echo " Health Check Endpoint: http://${ALB_DNS}/api/health"
echo " In Route 53, create an 'A (Alias)' record pointing api.mindvisiontech.com to this ALB DNS!"
echo "======================================================================"
