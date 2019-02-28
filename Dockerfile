FROM node:10

WORKDIR /usr/src/app/oauth2server

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .
COPY docker/docker.env .env

EXPOSE 3000

CMD [ "pm2-runtime", "process.yml" ]