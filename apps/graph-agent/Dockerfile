FROM node:20-alpine AS application

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY dist/apps/graph-agent  /app

CMD [ "node", "--enable-source-maps", "main.js" ]
