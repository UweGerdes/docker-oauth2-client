# Docker with Express.js boilerplate

### Install Docker

For Windows or Mac users: open [https://www.docker.com/get-started](https://www.docker.com/get-started) in your browser.

For Linus users: install Docker with:

```bash
curl -sSL https://get.docker.com | sh
sudo adduser [yourusername] docker
```

### Build the Docker image

If you have proxy caches for apt-get and npm you should build my baseimage (or baseimage-arm32v7 for Raspberry Pi 3) and nodejs before building the image.

```bash
$ docker build -t uwegerdes/expressjs-boilerplate .
```

## Run the Docker container

Run the container with:

```bash
$ docker run -it \
	-v $(pwd):/home/node/app \
	-p 8080:8080 \
	-p 8081:8081 \
	--name expressjs-boilerplate \
	uwegerdes/expressjs-boilerplate \
	bash
```

You should start `npm start` or `npm run dev` and open localhost:8080 for the server, localhost:8081 is the livereload port.

Restart it later with:

```bash
$ docker start -ai expressjs-boilerplate
```

## Using the boilerplate

You should add your project in the modules subdirectory with html/ejs/pug templates, less, js, server and tests. See the sample in modules/boilerplate.

Other samples are in my projects docker-vcards, docker-rpi-nodejs-gpio (more to come).
