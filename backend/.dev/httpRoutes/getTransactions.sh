#!/bin/bash

# Get the API token by logging in
api_token=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "reportuser1@email.com", "password": "testpassword"}' | jq -r '.token')

# Ensure the API token is not empty
if [ -z "$api_token" ]; then
  echo "API token cannot be empty. Exiting."
  exit 1
fi
# Make sure the responseFiles directory exists
mkdir -p responseFiles


curl -H "Authorization: Bearer $api_token" http://localhost:3000/api/export/ -o responseFiles/transactions.csv