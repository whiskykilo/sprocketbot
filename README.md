# @Sprocket the Nutanix Slackbot

Utilizing the brilliant [botkit](https://github.com/howdyai/botkit) framework and the Nutanix APIs, you are now able to control your Nutanix cluster from a slack channel.

This is a work in progress and *will* have bugs. It currently does not function in any capacity worth running.

I have only tested the deployment of `docker-machine` from a Mac to an Ubuntu 16.04 server. If you're running Windows, please let me know how it goes.

### Requirements

* [docker-machine](https://docs.docker.com/machine/install-machine/) installed on your local machine
* Nutanix CE, Nutanix AHV (ESXi planned)
* Admin access to said cluster
* Admin access to Slack Team

### Installation

1. Install `docker-machine` on your local machine
2. Clone this repository
3. Create API token in Slack for your bot
4. Create `.env` file
5. Create a docker host machine
6. Build the docker image
7. Deploy the docker image to your docker host

### Install `docker-machine`

Install by follow [These Docs](https://docs.docker.com/machine/install-machine/)

### Clone this repository

`git clone THIS REPO`

### Create API Token in Slack

*1. Click on Team Name in your Slack application*

![IMG](_images/readme00.png)

*2. Click `Apps & Integrations`*

*3. Search for `bots`*

![IMG](_images/readme01.png)

*4. Click `Add Configuration`*

![IMG](_images/readme02.png)

*5. Name your bot and `Add bot integration`*

![IMG](_images/readme03.png)

*6. Grab API Token*

![IMG](_images/readme04.png)

*7. Give your bot some love - a profile image, a name, etc*

### Create `.env`

Create a file named `.env` in the root of the repository.

Insert your API Token in the file like shown below:

`token=xoxb-THISISMYFAKETOKEN`

### Create a docker host machine

You need a few things to make sure everything works in the `docker-machine create` command below:

* The user must have `ALL=(ALL) NOPASSWD:ALL` attritube assigned to it (Put at the bottom of `sudo visudo`)
* Your public key must be available on the remote docker host to enable the automated installation of docker `ssh-copy-id user@ipaddress`

On your local machine's terminal issue the following command:

`docker-machine create -d generic --generic-ip-address 10.68.69.11 --generic-ssh-key $HOME/.ssh/id_rsa --generic-ssh-user sprocket --generic-ssh-port 22 sprocket`

Set your new docker host as the default deployment location

`eval $(docker-machine env sprocket)`

*Note:* in the above command, `sprocket` is the name you gave your docker host machine.

### Build docker image

`cd` into the repository folder from step #2.

This command will compile your docker container on the docker host.

`docker build -d sprocket .`

### Deploy docker image

Assuming all of the above commands have completed successfully, you should now be able to deploy the docker container and the bot will connect to slack.

I have put a couple of different options for running this command down below:

*Option 1 - Debugging*
This should be used to test your bot for debugging purposes. It will output all of the debug info from the slackbot into your console.

`docker run --name sprocket01 sprocket`

*Option 2 - Production (kinda)*
This should be used in production only if you want the bot to die if there's an error. The only difference here is adding the `-d` parameter, which means `detach` in the docker world.

`docker run -d --name sprocket01 sprocket`

*Option 3 - Production*
The command below is targeted for production use. It will restart the Docker container if there is an error and it will also restart the container if the host spontaneously reboots.

`docker run -d --restart always --name sprocket01 sprocket`
