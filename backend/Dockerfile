# Этап сборки
FROM node:16-alpine AS builder

WORKDIR /app

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости (включая dev-зависимости)
RUN npm ci

# Копируем все исходники
COPY . .

# Собираем проект (если требуется)
RUN npm run build

# Устанавливаем pm2 глобально
RUN npm install -g pm2

# Этап запуска
FROM node:16-alpine

WORKDIR /app

# Копируем только production-зависимости
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Копируем только собранные файлы (без исходников)
COPY --from=builder /app/dist ./dist

# Копируем конфиг pm2
COPY --from=builder /app/ecosystem.config.js .

# Устанавливаем pm2 глобально (без dev-зависимостей)
RUN npm install -g pm2

# Открываем порт приложения
EXPOSE 3000

# Запускаем приложение через pm2-runtime
CMD ["pm2-runtime", "ecosystem.config.js"]