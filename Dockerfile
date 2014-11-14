# Custom Dockerfile for Nginx

FROM nginx:1.7

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
