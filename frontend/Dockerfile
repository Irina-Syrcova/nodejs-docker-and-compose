# Этап сборки (builder)
FROM node:16-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап запуска (production)
FROM nginx:latest

# Копируем билд из предыдущего этапа
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфиг Nginx
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]