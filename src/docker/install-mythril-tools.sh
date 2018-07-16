#!/bin/bash

# Loop over all command-line arguments of the script.
# Each argument is treated as a tool name, and the latest master version of
# that tools is installed by the script.
for toolname
do
  if [ "$toolname" == "mythril" ]
  then
    git clone https://github.com/ConsenSys/mythril.git
    cd mythril && python3 setup.py install && cd ..
  fi

  if [ "$toolname" == "mythril-api" ]
  then
    git clone https://$GIT_USERNAME:$GIT_TOKEN@github.com/ConsenSys/mythril-api.git
    cd mythril-api && npm i && cd ..
  fi
done
