FROM node:16

#Create application directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy application source code files
COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]