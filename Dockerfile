FROM node:16

#Create application directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy application source code files
COPY . .

RUN npm install
RUN npm install dotenv

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN chmod +x entrypoint.sh

EXPOSE 8000