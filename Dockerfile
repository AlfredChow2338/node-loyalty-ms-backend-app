#FROM node:12-alpine
FROM node:lts-alpine3.12

# install simple http server for serving static content
#RUN npm install -g yarn

# install pm2
#RUN npm install pm2 -g

RUN yarn global add dotenv-cli

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
#COPY package*.json ./
COPY package.json yarn.lock ./

# install project dependencies
RUN yarn install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# get build script from docker compose
ARG SCRIPT_NAME

# build app for production with minification
#RUN $SCRIPT_NAME

EXPOSE 8081

#CMD ["pm2-runtime","start", "npm", "--", "start"]

ENV SCRIPT_NAME ${SCRIPT_NAME}

CMD yarn ${SCRIPT_NAME}

