FROM node:20-alpine AS application

WORKDIR /app

COPY dist/apps/graph-be  /app

CMD [ "node", "--enable-source-maps", "main.js" ]
