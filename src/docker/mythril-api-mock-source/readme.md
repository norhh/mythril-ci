
# Mythril API
![Master Build Status](https://img.shields.io/circleci/project/github/ConsenSys/mythril-api/master.svg)

Deployment Guide

### Description

## Prerequisites
1. Node 8.9
  1. NPM 5.5
2. Python 3.5
  1. PIP3
3. MongoDB 3.4 (only local development)
4. RabbitMQ 3.7 (only local development)


## Configuration
Located under `config/default.json` override production settings in `config/production.json`

- **PORT** the port to listen. Set automatically in heroku.
- **MONGODB_URL** the database url for mongoose. Set automatically in heroku.
- **RABBITMQ_URL** the rabbit mq url. Set automatically in heroku.
- **VERBOSE_LOGGING** true if enable debug logging. Should be disabled for production.
- **QUEUE_NAME** The name of the rabbit mq to use.
- **MYTH_COMMAND** The myth command to execute.


## Local Deployment with Docker (docker-compose required, https://docs.docker.com/compose/install/)
```bash
cd docker/
docker-compose up
# After some time you will have access to http://localhost:3100/mythril/v1
```


## Local Deployment
```bash
npm i
npm run dev # dev mode with logging
npm run dev:worker # open in new terminal

npm start # production mode
npm run worker # open in new terminal

```

## Heroku Deployment

Important: Initial deployment takes 20-30 minutes.  
You can check your status in https://dashboard.heroku.com/apps/YOUR_APP_NAME/activity  
Replace `YOUR_APP_NAME` to your application name.

```bash
git init
git add .
git commit -m init
heroku create
heroku addons:create cloudamqp:lemur
heroku addons:create mongolab:sandbox
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add --index 1 heroku/python
git push heroku master
heroku ps:scale web=1 worker=1
heroku open # get the url
```

## Running Lint
```bash
npm run lint
```

## Running tests
MongoDB should be running during the tests!

```bash
npm run test
```

## Verification
Import collection and env variable from `/docs` to postman.  
Video: http://take.ms/UhfBA  

The example postman collection contains example bytescodes.  
You can find more examples here https://github.com/ConsenSys/mythril/tree/master/solidity_examples or here https://ethernaut-devcon3.zeppelin.solutions/  
To compile .sol file to bytecodes do following steps:
- open http://remix.ethereum.org/
- paste source code
- click Details under Compile tab (right side)
- Scroll to RUNTIME BYTECODE and copy "object" value
- prefix `0x` is optional 


Multi upload source code is not implemented in Myrthil tool, but it's supported in my submission.  
You can check unit tests (MythrilService.test.js -> detectIssues).  
