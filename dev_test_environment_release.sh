#!/bin/sh
set -eo pipefail

NAME=mythril/dev_test_environment
VERSION_TAG=${NAME}:${CIRCLE_TAG#?}
LATEST_TAG=${NAME}:latest

if [ ! -e ./src/docker/.cache ];
  then mkdir ./src/docker/.cache;
fi

docker build -t ${VERSION_TAG} src/docker/.
docker tag ${VERSION_TAG} ${LATEST_TAG}

if [ ! -e ./src/docker/.cache/.ethereum ];
then \
  docker create --name app $VERSION_TAG; \
  docker cp app:/root/.ethereum ./src/docker/.cache; \
fi

docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD

docker push ${VERSION_TAG}
docker push ${LATEST_TAG}
