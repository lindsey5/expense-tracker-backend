#!/bin/bash

set -e

echo "***********************************"
echo "Navigate to the docker folder"
echo "***********************************"
cd "${DEPLOY_DIR:-/home/azureuser/docker}"

if [ -n "${DOCKERHUB_USERNAME:-}" ] && [ -n "${DOCKERHUB_TOKEN:-}" ]; then
  echo "***********************************"
  echo "Login to Docker Hub"
  echo "***********************************"
  echo "$DOCKERHUB_TOKEN" | sudo docker login --username "$DOCKERHUB_USERNAME" --password-stdin
fi

echo "***********************************"
echo "Stop the application"
echo "***********************************"
sudo docker compose down

echo "***********************************"
echo "Pull the latest image"
echo "***********************************"
sudo docker compose pull

echo "***********************************"
echo "Start the application"
echo "***********************************"
sudo docker compose up -d

echo "***********************************"
echo "Application is now running!"
echo "***********************************"
