#!/bin/bash

# Deploy Admin Dashboard to CBR Wine Hunter Container
# Run from Yavin (your dev machine)

echo "=== Deploying Admin Dashboard to CT 401 ==="

# Configuration
PROXMOX_HOST="192.168.50.48"
CONTAINER_ID="401"
LOCAL_DIR="/home/claude/admin-dashboard"
REMOTE_DIR="/opt/CBRWineHunter/admin"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Creating remote directory...${NC}"
ssh root@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- mkdir -p ${REMOTE_DIR}"

echo -e "${YELLOW}Step 2: Copying files to container...${NC}"
# Copy files via Proxmox host
tar -czf /tmp/admin-dashboard.tar.gz -C ${LOCAL_DIR} .
scp /tmp/admin-dashboard.tar.gz root@${PROXMOX_HOST}:/tmp/
ssh root@${PROXMOX_HOST} "pct push ${CONTAINER_ID} /tmp/admin-dashboard.tar.gz ${REMOTE_DIR}/admin-dashboard.tar.gz"
ssh root@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- tar -xzf ${REMOTE_DIR}/admin-dashboard.tar.gz -C ${REMOTE_DIR}"
ssh root@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- rm ${REMOTE_DIR}/admin-dashboard.tar.gz"
rm /tmp/admin-dashboard.tar.gz

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
ssh root@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cd ${REMOTE_DIR} && npm install'"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "To start the admin dashboard:"
echo "  ssh root@${PROXMOX_HOST}"
echo "  pct enter ${CONTAINER_ID}"
echo "  cd ${REMOTE_DIR}"
echo "  npm run dev"
echo ""
echo "Access at: http://192.168.50.121:5174"
