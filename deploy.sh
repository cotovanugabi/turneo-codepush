#!/bin/sh

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

# Verifică și afișează versiunea Node.js la început
echo "Node version before build:"
node -v

# Asigură-te că folosești Node.js 18
export NODE_VERSION=18
if command -v nvm &> /dev/null; then
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
fi

# Verifică din nou versiunea Node.js
echo "Node version after setup:"
node -v

# Build frontend
cd frontend
npm install
npm run build

# Build backend
cd ../api
npm install # Required because npm ci will install only prod dependencies because of app services environment
npm run clean
npm run build

# Copy everything to wwwroot
rm -rf /home/site/wwwroot/*
cp -r /home/site/repository/api/* /home/site/wwwroot/

# Ensure the public directory exists
mkdir -p /home/site/wwwroot/public

# Copy frontend build to public directory
cp -r /home/site/repository/frontend/dist/* /home/site/wwwroot/public/