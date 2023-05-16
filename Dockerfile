FROM node:20 AS BUILD_IMAGE
RUN mkdir -p /usr/src/logshield
WORKDIR /usr/src/logshield
COPY . .
RUN npm i

FROM node:20-alpine
WORKDIR /usr/src/logshield
CMD [ "node", "server.js" ]