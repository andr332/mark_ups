FROM node:lts-alpine

ARG deploy_env='prod'

RUN npm install servor -g
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env-$deploy_env .env
RUN npm run build

EXPOSE 8080
CMD [ "node", "src/server.js" ]