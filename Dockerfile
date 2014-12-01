# Custom Dockerfile for Nginx

FROM nginx:1.7

# INSTALL NODE

# verify gpg and sha256: http://nodejs.org/dist/v0.10.31/SHASUMS256.txt.asc
# gpg: aka "Timothy J Fontaine (Work) <tj.fontaine@joyent.com>"
RUN gpg --keyserver pgp.mit.edu --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D

ENV NODE_VERSION 0.10.33
ENV NPM_VERSION 2.1.6

RUN apt-get install -y curl git \
    && apt-get clean

# Install node and bower
RUN curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
    && gpg --verify SHASUMS256.txt.asc \
    && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
    && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
    && npm install -g npm@"$NPM_VERSION" \
    && npm install -g bower \
    && npm cache clear

# Remove the default configuration files
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/example_ssl.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx

WORKDIR /usr/share/nginx

# Install bower dependencies
RUN bower install --allow-root

EXPOSE 80 443
