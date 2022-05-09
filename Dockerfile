FROM node:alpine

WORKDIR /app
COPY . /app

RUN npm install -g grunt-cli
RUN npm install