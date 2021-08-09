FROM node:16

#Create application directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy application source code files
COPY app.js .
COPY config/ config/
COPY migrations/ migrations/
COPY models/ models/
COPY seeders/ seeders/
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
