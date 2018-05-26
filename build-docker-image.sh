#!/bin/bash

if [ -z "$1" ];
then
  docker build -t mythril:0.0.2 src/docker/.
else
  docker build -t mythril:0.0.2 src/docker/. "$1"
fi
