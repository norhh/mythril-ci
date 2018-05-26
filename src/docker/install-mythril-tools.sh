#!/bin/bash

# Loop over all command-line arguments of the script.
# Each argument is treated as a tool name, and the latest master version of
# that tools is installed by the script.
for toolname
do
  if [ "$toolname" == "laser-ethereum" ]
  then
    git clone https://github.com/b-mueller/laser-ethereum.git
    cd laser-ethereum && python3 setup.py install && cd ..
  fi

  if [ "$toolname" == "mythril" ]
  then
    git clone https://github.com/ConsenSys/mythril.git
    # TODO: similarly, there seems to be a bug when requiring from rlp, changing the version solves the issue
    # (check https://github.com/ethereum/pyethereum/issues/868)
    cd mythril && python3 setup.py install && pip install rlp==0.6.0 && cd ..
  fi

  if [ "$toolname" == "mythril-api" ]
  then
    git clone https://$GIT_USERNAME:$GIT_TOKEN@github.com/ConsenSys/mythril-api.git
    cd mythril-api && npm i && cd ..
  fi
done
