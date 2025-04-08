# Указываем базовый образ
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшийся код
COPY . .

# Экспонируем порт
EXPOSE 3001

# Команда для запуска приложения
CMD ["npm", "run", "dev"]
