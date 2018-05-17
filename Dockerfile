#
# Docker Image with Mythril and Solc for CI/CD of Ethereum Solidity Codes
#

# Pull base image
FROM ubuntu:16.04

# Install Python && Necessary build tools
RUN apt-get update \
 && apt-get install -y software-properties-common \
 && add-apt-repository ppa:ethereum/ethereum \
 && apt-get update \
 && apt-get install -y \
      build-essential \
      git \
      curl \
      libssl-dev \
      python3 \
      python3-pip \
      python3-dev \
      libbz2-dev \
      libsqlite3-dev \
      libreadline-dev \
      solc \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Installs pyenv to enable easy installation of several python versions
ENV PATH="/root/.pyenv/bin:$PATH"
RUN curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash \
 && echo "export PATH=\"/root/.pyenv/bin:$PATH\"" >> ~/.bash_profile \
 && echo "eval \"\$(pyenv init -)\"" >> ~/.bash_profile \
 && echo "eval \"\$(pyenv virtualenv-init -)\"" >> ~/.bash_profile \
 && pip3 install tox-pyenv 

# Install Pythons
RUN pyenv install 3.5.5
RUN pyenv install 3.6.5
RUN cd /home \
 && pyenv local \
      3.5.5 \
      3.6.5

# Install Mythril
RUN pip3 install mythril

# Create scripts directory to store the python script
RUN mkdir scripts

# Copy local python script to Docker image
COPY scripts/processor.py scripts/processor.py
