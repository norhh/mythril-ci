# Dockerfile for Docker image of Mythril eco-system.

# From the latest long-term support version of Ubuntu.
FROM ubuntu:rolling

# Sets non-interactive mode, so that there is no interactive prompts during
# the build.
ARG DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION="node_8.x"

# Installation from APT repositories.
RUN \
  apt-get update; \
  apt-get install -y \
    apt-transport-https \
    build-essential \
    curl \
    git \
    libreadline-dev \
    libssl1.0-dev \
    libbz2-dev \
    pandoc \
    python3-dev \
    python3-pip \
    software-properties-common \
    wget \
    zlib1g-dev; \
  # Ethereum repo.
  add-apt-repository ppa:ethereum/ethereum; \
  # MongoDB release key and repo.
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 \
    --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5; \
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-3.6.list; \
  # Nodesource release key and repository.
  curl -sL https://deb.nodesource.com/setup_8.x | bash -; \
  # Heroku release key and repository.
  curl https://cli-assets.heroku.com/install-ubuntu.sh | sh; \
  # RabbitMQ.
  wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc \
    | apt-key add -; \
  # Installation of additional stuff.
  apt-get update; \
  apt-get install -y \
    ethereum \
    mongodb-org \
    nodejs \
    rabbitmq-server \
    solc; \
  # Clean-up to reduce Docker layer size.
  apt-get clean; \
  rm -rf /var/lib/apt/lists/*;

# Installs pyenv to enable installation of several python versions.
ENV PATH="/root/.pyenv/bin:$PATH"
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv; \
  echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile; \
  echo 'export PATH="/root/.pyenv/bin:$PATH"' >> ~/.bash_profile; \
  echo 'eval "\$(pyenv init -)"' >> ~/.bash_profile; \
  echo 'eval "\$(pyenv virtualenv-init -)"' >> ~/.bash_profile; \
  pip3 install tox-pyenv ;

# Installs Pythons
RUN \
  pyenv install 3.4.8; \
  pyenv install 3.5.5; \
  pyenv install 3.6.5;

# Activates Pythons.
RUN pyenv global \
  3.4.8 \
  3.5.5 \
  3.6.5;

# Install Truffle.
RUN npm install -g truffle

# Install Python dependencies of Mythril.
RUN \
  # pip3 install --upgrade pip; \
  pip3 install \
    BTrees \
    coverage \
    eth_abi \
    eth-account \
    eth-hash \
    eth-keyfile \
    eth-keys \
    eth-rlp \
    eth-tester \
    eth-utils \
    ethereum \
    plyvel \
    py-flags \
    py-solc \
    requests \
    setuptools \
    twine \
    z3-solver \
    ZODB;

# Additional configuration.
WORKDIR home
RUN \
  rm /usr/bin/python; \
  ln -s /usr/bin/python3 /usr/bin/python; \
  ln -s /usr/bin/pip3 /usr/bin/pip;

# Copying-in auxiliary assets.
COPY ethereum.password install-mythril-tools.sh ./

# Integration tests - make sure to cache dependency installs
COPY integration-tests ./integration-tests
RUN cd integration-tests && npm install && cd ..

# Helper command to run integration tests from within this generated image
COPY run-integration-tests.sh ./

# Create new Ethereum account.
RUN geth account new --password ./ethereum.password

# Run geth in background for ten minutes.
RUN timeout --preserve-status 10m geth --syncmode full
