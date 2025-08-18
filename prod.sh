#!/bin/bash

# Production startup script for SchoolSphere with custom authentication
# This script sets up environment variables for a production environment
# and starts the server

# Set environment for production
export NODE_ENV=production

# Set port (default: 5000)
export PORT=${PORT:-5000}

# Enable custom authentication
export USE_CUSTOM_AUTH=1

# Set session secret (generate a random one if not set)
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "Generated random SESSION_SECRET"
fi

# Set admin email
if [ -z "$ADMIN_EMAIL" ]; then
  export ADMIN_EMAIL=${ADMIN_EMAIL:-admin@schoolsphere.com}
  echo "Using default ADMIN_EMAIL: $ADMIN_EMAIL"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Please provide a PostgreSQL connection string."
  echo "Example: export DATABASE_URL=postgres://user:pass@host/db?sslmode=require"
  exit 1
fi

# Initial setup flag - only set to 1 during first run
# export ALLOW_ADMIN_SETUP=1

echo "Starting SchoolSphere in production mode..."
echo "Custom authentication enabled"
echo "Admin login available at: /admin-login"

# Run database migrations if needed
echo "Running database migrations..."
npx drizzle-kit push:pg

# Start the server
echo "Starting server on port $PORT..."
npm start
