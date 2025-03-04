#!/bin/bash

# Make sure we are logged in to Azure, run `az login` if not already logged in
# Check if we're logged in
if ! az account show &> /dev/null; then
  echo "Not logged in to Azure. Running az login..."
  az login
else
  echo "Already logged in to Azure."
fi

# Set the subscription if needed
# az account set --subscription "<your-subscription-id>"

# Deploy/update infrastructure using parameters file
az deployment group create \
  --resource-group "turneo-codepush" \
  --template-file "./codepush-infrastructure.bicep" \
  --parameters @parameters.json

echo "Infrastructure deployment completed!" 