
FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json .
RUN npm install

COPY tsconfig.json .
COPY src/*.ts src/
RUN npm run build

FROM registry.heroiclabs.com/heroiclabs/nakama:3.17.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY --from=node-builder /backend/build/*.js /nakama/data/build/
COPY --from=node-builder /backend/build/*.js /nakama/data/modules/
COPY local.yml /nakama/data/