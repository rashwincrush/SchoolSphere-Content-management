#!/bin/bash

# Development startup script for SchoolSphere local dev server with mock auth
# This script sets all required environment variables for local development

# Configure port (modify if needed)
export PORT=5099

# Enable dev auth mode with in-memory storage
export USE_DEV_AUTH=1

# Set session secret (this is only for local dev)
export SESSION_SECRET=local-dev-secret

# Start the development server
echo "Starting SchoolSphere with dev auth on port $PORT..."
echo "- Mock auth enabled: USE_DEV_AUTH=$USE_DEV_AUTH"
echo "- Available routes:"
echo "  * http://localhost:$PORT/ (landing page)"
echo "  * http://localhost:$PORT/api/login (auto-login as admin)"
echo "  * http://localhost:$PORT/dev-login (credential login form)"
echo

# Run the dev server
npm run dev

# Unset variables when done
unset PORT
unset USE_DEV_AUTH
unset SESSION_SECRET
