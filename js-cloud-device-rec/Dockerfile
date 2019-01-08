FROM node:8-alpine
ARG basedir="api-message-receiver"
WORKDIR /home/app
# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent
# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .
EXPOSE 80
ENTRYPOINT [ "npm" , "start" ]