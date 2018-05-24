#!/bin/bash
# test script to run CI directly from the generated Docker image (CircleCI should execute these commands separately
# as specified in other projects' .circleci/config.yml)

cd /home && ./install-mythril-tools.sh laser-ethereum mythril mythril-api
service rabbitmq-server start
mkdir -p /home/mongodb && mongod --dbpath=/home/mongodb > /dev/null &
export PORT=3010
cd /home/mythril-api
npm start > /dev/null &
npm run worker > /dev/null &
# make sure to leave some time to make sure everything needed properly boots
sleep 3
cd /home/integration-tests && npm test

killall node
