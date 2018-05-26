# Dockerfile for Docker image of Mythril eco-system.

# From the latest long-term support version of Ubuntu.
FROM ubuntu:rolling

# Install generic build dependencies.
RUN apt-get update
RUN apt-get install -y apt-utils build-essential curl git libssl-dev pandoc python3.6 python3-pip software-properties-common wget

# Install Ethereum, Heroku CLI, MongoDB, NodeJS, Solidity.
RUN wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN add-apt-repository ppa:ethereum/ethereum
RUN apt-get update

# DEBIAN_FRONTEND=noninteractive fixes an issue where tzdata blocks the image building
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y ethereum mongodb-org nodejs solc

# Install Truffle.
RUN npm install -g truffle

# Install Python dependencies of Mythril.
RUN pip3 install --upgrade pip
RUN pip3 install BTrees coverage eth_abi eth-account eth-hash eth-keyfile eth-keys eth-rlp eth-tester eth-utils ethereum plyvel py-flags py-solc requests setuptools twine z3-solver ZODB

# Install RabbitMQ and psmisc, needed to make sure killall can be executed after running integration tests
RUN wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | apt-key add - &&\
  apt-get update &&\
  apt-get install -y rabbitmq-server psmisc

# Additional configuration.
WORKDIR home
RUN rm /usr/bin/python
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN ln -s /usr/bin/pip3 /usr/bin/pip

# Copying-in auxiliary assets.
COPY ethereum.password install-mythril-tools.sh ./

# Integration tests - make sure to cache dependency installs
RUN mkdir integration-tests
COPY ./integration-tests/package.json ./integration-tests/package-lock.json ./integration-tests/
RUN cd integration-tests && npm i && cd ..
# ... and copy all files after dependencies were cached
COPY integration-tests ./integration-tests/

# TODO: remove these comments after getting clone access to the mythril-api repo
# we statically copy mythril-api-mock-source, and then install it to
# mythril-api for whichever client executes "./install-mythril-tools.sh mythril-api"
COPY mythril-api-mock-source ./mythril-api-mock-source/

# Helper command to run integration tests from within this generated image
COPY run-integration-tests.sh ./

# Create new Ethereum account.
RUN geth account new --password ./ethereum.password

# Run geth in background for ten minutes.
RUN timeout --preserve-status 10m geth --syncmode full
