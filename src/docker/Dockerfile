# Dockerfile for Docker image of Mythril eco-system.

# From the latest long-term support version of Ubuntu.
FROM ubuntu:rolling

# Set noninteractive so that there are no interactive prompts during instalation.
#   Using ARG ensures the environment variable is only present for build and not for execution.
ARG DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION="node_8.x"

# Install generic build dependencies and add repositories
RUN apt-get update \
 && apt-get install -y \
      software-properties-common \
      apt-transport-https \
 && add-apt-repository ppa:ethereum/ethereum \
 #  Mongodb release key and repository
 && apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5 \
 && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list \
 #  Nodesource release key and repository
 && apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv 9FD3B784BC1C6FC31A8A0A1C1655A0AB68576280 \
 && DISTRO="$(lsb_release -s -c)" \
 && echo "deb https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
 && echo "deb-src https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
 #  Heroku release key and repository
 && apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv 150C6249147592DE6D91981CC927EBE00F1B0520 \
 && echo "deb https://cli-assets.heroku.com/apt ./" > /etc/apt/sources.list.d/heroku.list \
 #  Clean up files to reduce image size
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install all required packages
RUN apt-get update \ 
 && apt-get install -y \
      build-essential \
      wget \
      curl \
      git \
      pandoc \
      heroku \
      python3-pip \
      python3-dev \
      libssl1.0-dev \
      zlib1g-dev \
      libbz2-dev \
      libsqlite3-dev \
      libreadline-dev \
      ethereum \
      mongodb-org \
      nodejs \
      solc \
 #  Clean up files to reduce image size
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Installs pyenv to enable installation of several python versions
ENV PATH="/root/.pyenv/bin:$PATH"
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv \
 && echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile \
 && echo 'export PATH="/root/.pyenv/bin:$PATH"' >> ~/.bash_profile \
 && echo 'eval "\$(pyenv init -)"' >> ~/.bash_profile \
 && echo 'eval "\$(pyenv virtualenv-init -)"' >> ~/.bash_profile \
 && pip3 install tox-pyenv 

# Install Pythons
RUN pyenv install 3.4.8
RUN pyenv install 3.5.5
RUN pyenv install 3.6.5

# Activate pythons
WORKDIR home
RUN pyenv global \
      3.4.8 \
      3.5.5 \
      3.6.5

# Install Truffle.
RUN npm install -g truffle

# Copying-in auxiliary assets.
COPY ethereum.password install-mythril-tools.sh ./

# Create new Ethereum account.
RUN geth account new --password ./ethereum.password

# Run geth in background for ten minutes.
RUN timeout --preserve-status 10m geth --syncmode full
