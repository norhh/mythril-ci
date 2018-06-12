# Docker Image for Unit and Integration Testing of Mythril Tools
Automatically released to DockerHub under **mythril/dev_test_environment**
name.

### The Image
- Created image contains all dependencies necessary for Mythril tools;
- It has some piece of Ethereum blockchain data;

- It contains `install-mythril-tools.sh` script that helps to install latest
  **master** versions of mythril-family tools. Use it like:
  ```sh
  $ ./install-mythril-tools.sh laser-ethereum mythril mythril-api
  ```
  **BEWARE:** To install **mythril-api** this way, you should have proper
  `GIT_USERNAME` and `GIT_TOKEN` environment variables set (as the repo is
  private).

- It also contains integration tests located in /home/integration-tests. In order
  to run them, navigate to that directory and run `npm test`. Make sure to have
  MongoDB, RabbitMQ, the server and the worker started before doing that.
  In case of wanting to test from this image, that can be done by running a new
  container with it, by executing:

  ```sh
  docker run -it mythril:0.0.2 bash
  $ ./run-integration-tests.sh
  ```
