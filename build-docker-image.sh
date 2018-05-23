#!/bin/bash

IMAGE_NAME="mythril"
VERSION_NUMBER="0.0.1"

if [ -z "$1" ];
then
  docker build -t "$IMAGE_NAME:$VERSION_NUMBER" src/docker/.
else
  docker build -t "$IMAGE_NAME:$VERSION_NUMBER" src/docker/. "$1"
fi
