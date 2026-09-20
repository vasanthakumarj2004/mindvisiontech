#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech AWS VPC & Network Infrastructure Provisioning Script
# Provisions:
# 1. Custom VPC (10.0.0.0/16) with DNS support
# 2. Internet Gateway (IGW) attached to VPC
# 3. Two Public Subnets in 2 Availability Zones (for ALB & Public Workloads)
# 4. Two Private Subnets in 2 Availability Zones (for Isolated Workloads)
# 5. Route Tables & Subnet Associations
# ==============================================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="mindvisiontech"
VPC_CIDR="10.0.0.0/16"
PUB_SUBNET_1_CIDR="10.0.1.0/24"
PUB_SUBNET_2_CIDR="10.0.2.0/24"
PRIV_SUBNET_1_CIDR="10.0.10.0/24"
PRIV_SUBNET_2_CIDR="10.0.20.0/24"

echo "======================================================================"
echo " Provisioning Production VPC Network for ${PROJECT_NAME}"
echo " Region: ${AWS_REGION}"
echo " VPC CIDR: ${VPC_CIDR}"
echo "======================================================================"

# 1. Discover Availability Zones
AZS=($(aws ec2 describe-availability-zones --region "${AWS_REGION}" --query "AvailabilityZones[?State=='available'].ZoneName" --output text))
AZ_1="${AZS[0]}"
AZ_2="${AZS[1]}"
echo "Selected Availability Zones: ${AZ_1}, ${AZ_2}"

# 2. Create VPC
echo "--> [1/5] Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block "${VPC_CIDR}" \
    --region "${AWS_REGION}" \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc},{Key=Environment,Value=production}]" \
    --query "Vpc.VpcId" \
    --output text)
echo "Created VPC: ${VPC_ID}"

# Enable DNS support & hostnames
aws ec2 modify-vpc-attribute --vpc-id "${VPC_ID}" --enable-dns-support '{"Value": true}' --region "${AWS_REGION}"
aws ec2 modify-vpc-attribute --vpc-id "${VPC_ID}" --enable-dns-hostnames '{"Value": true}' --region "${AWS_REGION}"

# 3. Create Internet Gateway
echo "--> [2/5] Creating and attaching Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
    --region "${AWS_REGION}" \
    --query "InternetGateway.InternetGatewayId" \
    --output text)
aws ec2 attach-internet-gateway --vpc-id "${VPC_ID}" --internet-gateway-id "${IGW_ID}" --region "${AWS_REGION}"
echo "Attached IGW: ${IGW_ID}"

# 4. Create Public Subnets
echo "--> [3/5] Creating Public Subnets..."
PUB_SUB_1=$(aws ec2 create-subnet \
    --vpc-id "${VPC_ID}" \
    --cidr-block "${PUB_SUBNET_1_CIDR}" \
    --availability-zone "${AZ_1}" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-1}]" \
    --region "${AWS_REGION}" \
    --query "Subnet.SubnetId" \
    --output text)

PUB_SUB_2=$(aws ec2 create-subnet \
    --vpc-id "${VPC_ID}" \
    --cidr-block "${PUB_SUBNET_2_CIDR}" \
    --availability-zone "${AZ_2}" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-2}]" \
    --region "${AWS_REGION}" \
    --query "Subnet.SubnetId" \
    --output text)

# Enable auto-assign public IPv4
aws ec2 modify-subnet-attribute --subnet-id "${PUB_SUB_1}" --map-public-ip-on-launch --region "${AWS_REGION}"
aws ec2 modify-subnet-attribute --subnet-id "${PUB_SUB_2}" --map-public-ip-on-launch --region "${AWS_REGION}"
echo "Public Subnets: ${PUB_SUB_1} (${AZ_1}), ${PUB_SUB_2} (${AZ_2})"

# 5. Create Private Subnets
echo "--> [4/5] Creating Private Subnets..."
PRIV_SUB_1=$(aws ec2 create-subnet \
    --vpc-id "${VPC_ID}" \
    --cidr-block "${PRIV_SUBNET_1_CIDR}" \
    --availability-zone "${AZ_1}" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-1}]" \
    --region "${AWS_REGION}" \
    --query "Subnet.SubnetId" \
    --output text)

PRIV_SUB_2=$(aws ec2 create-subnet \
    --vpc-id "${VPC_ID}" \
    --cidr-block "${PRIV_SUBNET_2_CIDR}" \
    --availability-zone "${AZ_2}" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-2}]" \
    --region "${AWS_REGION}" \
    --query "Subnet.SubnetId" \
    --output text)
echo "Private Subnets: ${PRIV_SUB_1} (${AZ_1}), ${PRIV_SUB_2} (${AZ_2})"

# 6. Route Tables & Routing
echo "--> [5/5] Configuring Route Tables..."
PUB_RT=$(aws ec2 create-route-table \
    --vpc-id "${VPC_ID}" \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
    --region "${AWS_REGION}" \
    --query "RouteTable.RouteTableId" \
    --output text)

# Add route to Internet Gateway
aws ec2 create-route --route-table-id "${PUB_RT}" --destination-cidr-block 0.0.0.0/0 --gateway-id "${IGW_ID}" --region "${AWS_REGION}" > /dev/null

# Associate Public Subnets with Public Route Table
aws ec2 associate-route-table --subnet-id "${PUB_SUB_1}" --route-table-id "${PUB_RT}" --region "${AWS_REGION}" > /dev/null
aws ec2 associate-route-table --subnet-id "${PUB_SUB_2}" --route-table-id "${PUB_RT}" --region "${AWS_REGION}" > /dev/null

PRIV_RT=$(aws ec2 create-route-table \
    --vpc-id "${VPC_ID}" \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-rt}]" \
    --region "${AWS_REGION}" \
    --query "RouteTable.RouteTableId" \
    --output text)
aws ec2 associate-route-table --subnet-id "${PRIV_SUB_1}" --route-table-id "${PRIV_RT}" --region "${AWS_REGION}" > /dev/null
aws ec2 associate-route-table --subnet-id "${PRIV_SUB_2}" --route-table-id "${PRIV_RT}" --region "${AWS_REGION}" > /dev/null

echo "======================================================================"
echo " VPC SETUP COMPLETE!"
echo " Export the following variables to run deploy/aws/provision-asg.sh:"
echo " export VPC_ID=\"${VPC_ID}\""
echo " export SUBNET_1=\"${PUB_SUB_1}\""
echo " export SUBNET_2=\"${PUB_SUB_2}\""
echo "======================================================================"
