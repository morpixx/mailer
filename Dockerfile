# syntax=docker/dockerfile:1
FROM node:20

# Установим Python, make, g++ для сборки better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci
RUN cd client && npm ci
COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
