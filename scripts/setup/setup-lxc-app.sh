#!/bin/bash
# Setup script for Application LXC container
# Run this on your Proxmox host

set -e

echo "========================================="
echo "CBR Wine Hunter - Application LXC Setup"
echo "========================================="
echo ""

# Configuration
CT_ID=201  # Change this to an available container ID
CT_HOSTNAME="cbr-app"
CT_MEMORY=4096
CT_SWAP=1024
CT_DISK=40
CT_CORES=4
TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
STORAGE="local-lvm"
PASSWORD="changeme"  # Change this!

# Network configuration - adjust for your network
BRIDGE="vmbr0"
IP_ADDRESS="192.168.1.201/24"  # Change to your network
GATEWAY="192.168.1.1"  # Change to your gateway

echo "Creating LXC container with ID: $CT_ID"
echo "Hostname: $CT_HOSTNAME"
echo "IP Address: $IP_ADDRESS"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Create the container
pct create $CT_ID $TEMPLATE \
    --hostname $CT_HOSTNAME \
    --memory $CT_MEMORY \
    --swap $CT_SWAP \
    --cores $CT_CORES \
    --rootfs $STORAGE:$CT_DISK \
    --net0 name=eth0,bridge=$BRIDGE,ip=$IP_ADDRESS,gw=$GATEWAY \
    --password $PASSWORD \
    --unprivileged 1 \
    --features nesting=1 \
    --start 1

echo "Waiting for container to start..."
sleep 10

# Update system and install base packages
echo "Installing base packages..."
pct exec $CT_ID -- bash -c "
    apt-get update
    apt-get install -y \
        curl \
        wget \
        git \
        vim \
        build-essential \
        pkg-config \
        libssl-dev \
        ca-certificates \
        gnupg
"

# Install Python 3.11
echo "Installing Python 3.11..."
pct exec $CT_ID -- bash -c "
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev
    
    # Verify Python version
    python3 --version
"

# Install Node.js 20
echo "Installing Node.js 20..."
pct exec $CT_ID -- bash -c "
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    
    NODE_MAJOR=20
    echo \"deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_\$NODE_MAJOR.x nodistro main\" | tee /etc/apt/sources.list.d/nodesource.list
    
    apt-get update
    apt-get install -y nodejs
    
    # Verify installation
    node --version
    npm --version
"

# Install PostgreSQL client tools
echo "Installing PostgreSQL client..."
pct exec $CT_ID -- bash -c "
    apt-get install -y postgresql-client
"

# Create application directory
echo "Creating application directory..."
pct exec $CT_ID -- bash -c "
    mkdir -p /opt/cbr-wine-hunter
    chown -R root:root /opt/cbr-wine-hunter
"

# Install system dependencies for Playwright
echo "Installing Playwright system dependencies..."
pct exec $CT_ID -- bash -c "
    apt-get install -y \
        libnss3 \
        libnspr4 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libdbus-1-3 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2
"

echo ""
echo "========================================="
echo "Application LXC Setup Complete!"
echo "========================================="
echo ""
echo "Container ID: $CT_ID"
echo "Hostname: $CT_HOSTNAME"
echo "IP Address: ${IP_ADDRESS%/*}"
echo ""
echo "Installed:"
echo "  - Python 3.11+"
echo "  - Node.js 20+"
echo "  - PostgreSQL client"
echo "  - Git"
echo ""
echo "To access the container:"
echo "  pct enter $CT_ID"
echo ""
echo "Next steps:"
echo "1. Clone the CBR Wine Hunter repository"
echo "2. Set up Python virtual environment"
echo "3. Install dependencies"
echo "4. Configure environment variables"
echo "5. Run the application"
echo ""
