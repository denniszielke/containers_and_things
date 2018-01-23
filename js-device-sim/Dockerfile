FROM node:8.2.0-alpine
RUN mkdir -p /usr/src/app
COPY ./web-device-sim/ /usr/src/app/
WORKDIR /usr/src/app
RUN npm install
CMD node /usr/src/app/server.js
