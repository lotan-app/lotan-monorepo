FROM node:20-bullseye-slim AS builder

WORKDIR /app

RUN npm init

RUN npm i --omit=dev graphql graphql-scalars type-graphql typegraphql-prisma @mysten/sui prisma@5.18.0


FROM node:20-bullseye-slim AS application

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules

COPY dist/apps/graph-edge  /app

EXPOSE 8080

CMD [ "node", "--enable-source-maps", "main.js" ]
