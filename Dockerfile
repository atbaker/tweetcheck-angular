# Custom Dockerfile for Nginx

FROM nginx:1.7

# Remove the default configuration files
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/example_ssl.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY app /usr/share/nginx/html

EXPOSE 80 443
