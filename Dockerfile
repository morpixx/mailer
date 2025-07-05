# syntax=docker/dockerfile:1
FROM node:20

# Установим Python, make, g++ для сборки native-зависимостей (например, better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++

# Устанавливаем рабочую директорию для сервера
WORKDIR /app

# Копируем package-файлы и устанавливаем зависимости сервера
COPY package.json package-lock.json ./
RUN npm ci

# Переходим в директорию клиента и устанавливаем его зависимости
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Копируем весь исходный код приложения
WORKDIR /app
COPY . .

# Собираем клиент и сервер (предполагается, что в package.json есть скрипты build)
RUN npm run build

# Открываем порт, на котором стартует приложение
EXPOSE 8080

# Команда запуска
CMD ["npm", "start"]
