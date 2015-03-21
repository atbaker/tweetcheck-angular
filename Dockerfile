# Custom Dockerfile for Nginx

FROM nginx:1.7

# Install Node.js (mostly for Bower)

# verify gpg and sha256: http://nodejs.org/dist/v0.10.30/SHASUMS256.txt.asc
# gpg: aka "Timothy J Fontaine (Work) <tj.fontaine@joyent.com>"
# gpg: aka "Julien Gilli <jgilli@fastmail.fm>"
RUN gpg --keyserver pool.sks-keyservers.net --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D 114F43EE0176B71C7BC219DD50A3051F888C628D

ENV NODE_VERSION 0.12.0
ENV NPM_VERSION 2.7.1

RUN buildDeps='curl' \
    && set -x \
    && apt-get update && apt-get install -y $buildDeps curl git --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
    && gpg --verify SHASUMS256.txt.asc \
    && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
    && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
    && apt-get purge -y --auto-remove $buildDeps \
    && npm install -g npm@"$NPM_VERSION" \
    && npm install -g bower \
    && npm cache clear

# Remove the default configuration files
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/example_ssl.conf

# Add TweetCheck certificates
COPY conf/ssl-bundle.crt /etc/ssl/ssl-bundle.crt
COPY conf/tweetcheck.key /etc/ssl/tweetcheck.key

# Update the working directory
WORKDIR /usr/share/nginx/html

# Install bower dependencies
RUN mkdir -p /usr/share/nginx/html/app/lib
COPY bower.json .bowerrc /usr/share/nginx/html/
RUN bower install --config.interactive=false --allow-root

# Add nginx configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Copy in latest source code
COPY . /usr/share/nginx/html

EXPOSE 80 443
