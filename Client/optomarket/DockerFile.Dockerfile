# ЭТАП 1: Сборка
FROM node:22-alpine AS build

WORKDIR /app

# Копируем конфиги и ставим зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код и собираем проект
COPY . .
RUN npm run build -- --configuration production

# ЭТАП 2: Раздача статики через Nginx
FROM nginx:stable-alpine

# Копируем билд из первого этапа.
# ВАЖНО: Путь dist/optomarket может меняться, проверь папку после npm run build
COPY --from=build /app/dist/optomarket/browser /usr/share/nginx/html

# Копируем кастомный конфиг Nginx (если есть) или используем дефолт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
