#!/bin/bash

IMAGE_NAME="mythril-integration-tests"
IMAGE_VERSION="0.0.4"

if [ -z "$1" ];
then
  docker build -t "$IMAGE_NAME:$IMAGE_VERSION" src/docker/.
else
  docker build -t "$IMAGE_NAME:$IMAGE_VERSION" src/docker/. "$1"
fi
