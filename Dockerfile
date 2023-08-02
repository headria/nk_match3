FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json .
RUN npm install

# Install TypeScript
RUN npm install -g typescript

COPY tsconfig.json .
COPY . .
RUN npx tsc

FROM registry.heroiclabs.com/heroiclabs/nakama:3.17.0

COPY --from=node-builder /backend/build/ /nakama/data/modules/build/
COPY local.yml /nakama/data