# Custom Dockerfile for Nginx

FROM node:0.10

# Create a directory for our source code
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Bower
RUN npm install -g grunt bower && npm cache clear

# Install package dependencies
COPY package.json /usr/src/app/
RUN npm install

# Install bower dependencies
COPY bower.json /usr/src/app/
RUN bower install --allow-root --config.interactive=false

# Add source code to image
COPY . /usr/src/app

# Build our code into /dist
RUN gulp build

# Expose the /dist directory as a volume
VOLUME /usr/src/app/dist
