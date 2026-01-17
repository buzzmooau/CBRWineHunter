#!/bin/bash
# Setup script for PostgreSQL LXC container
# Run this on your Proxmox host

set -e

echo "========================================="
echo "CBR Wine Hunter - PostgreSQL LXC Setup"
echo "========================================="
echo ""

# Configuration
CT_ID=200  # Change this to an available container ID
CT_HOSTNAME="cbr-db"
CT_MEMORY=2048
CT_SWAP=512
CT_DISK=20
CT_CORES=2
TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
STORAGE="local-lvm"
PASSWORD="changeme"  # Change this!

# Network configuration - adjust for your network
BRIDGE="vmbr0"
IP_ADDRESS="192.168.1.200/24"  # Change to your network
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

# Update and install PostgreSQL
echo "Installing PostgreSQL..."
pct exec $CT_ID -- bash -c "
    apt-get update
    apt-get install -y postgresql-15 postgresql-contrib-15
    systemctl enable postgresql
    systemctl start postgresql
"

# Configure PostgreSQL for network access
echo "Configuring PostgreSQL..."
pct exec $CT_ID -- bash -c "
    # Allow network connections
    echo \"listen_addresses = '*'\" >> /etc/postgresql/15/main/postgresql.conf
    
    # Add pg_hba.conf entry for app container
    # Adjust IP range to match your network
    echo \"host    all    all    192.168.1.0/24    md5\" >> /etc/postgresql/15/main/pg_hba.conf
    
    # Restart PostgreSQL
    systemctl restart postgresql
"

# Create database and user
echo "Creating database and user..."
pct exec $CT_ID -- su - postgres -c "
    psql -c \"CREATE DATABASE cbr_wine_hunter;\"
    psql -c \"CREATE USER wineuser WITH PASSWORD 'your_secure_password';\"
    psql -c \"GRANT ALL PRIVILEGES ON DATABASE cbr_wine_hunter TO wineuser;\"
    psql -c \"ALTER DATABASE cbr_wine_hunter OWNER TO wineuser;\"
"

echo ""
echo "========================================="
echo "PostgreSQL LXC Setup Complete!"
echo "========================================="
echo ""
echo "Container ID: $CT_ID"
echo "Hostname: $CT_HOSTNAME"
echo "IP Address: ${IP_ADDRESS%/*}"
echo ""
echo "Database Name: cbr_wine_hunter"
echo "Database User: wineuser"
echo "Database Password: your_secure_password"
echo ""
echo "IMPORTANT: Change the database password!"
echo ""
echo "To access the container:"
echo "  pct enter $CT_ID"
echo ""
echo "To connect to PostgreSQL:"
echo "  pct exec $CT_ID -- su - postgres -c psql"
echo ""
echo "Next steps:"
echo "1. Change the database password"
echo "2. Copy schema.sql to the container"
echo "3. Run the schema to create tables"
echo ""
