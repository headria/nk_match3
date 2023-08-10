
FROM node:alpine AS node-builder

WORKDIR /backend


COPY . .
RUN npm install
RUN npm run build || true

FROM registry.heroiclabs.com/heroiclabs/nakama:3.17.0

COPY --from=node-builder /backend/ /nakama/data/