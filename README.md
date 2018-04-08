# Docker Image for Unit and Integration Testing of Mythril Tools

### To Build The Image
1.  Install [Docker](https://www.docker.com/);

2.  Execute `$ sudo ./build-docker-image.sh` to build the image;

    In case of failure, try `$ sudo ./build-docker-image.sh --no-cache`.

    The build step will take ~15 minutes, out of which 10 minutes will be spent
    on blockchain syncronization.

3.  To push it to Dockerhub:
    ```sh
    $ sudo docker login
    $ sudo docker tag <IMAGENAME>:<VERSION> <USERNAME>/<IMAGENAME>:<VERSION>
    $ sudo docker push <USERNAME>/<IMAGENAME>:<VERSION>
    ```

### The Image
- Created image contains all dependencies necessary for Mythril tools;
- It has some piece of Ethereum blockchain data;
- It contains `install-mythril-tools.sh` script that helps to install latest
  **master** versions of mythril-family tools. Use it like:
  ```sh
  $ ./install-mythril-tools.sh laser-ethereum mythril
  ```