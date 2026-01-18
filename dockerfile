# Troque node:20-alpine por:
FROM node:20-slim

# No slim (Debian), o comando de dependências muda:
RUN apt-get update && apt-get install -y python3 make g++ gcc

WORKDIR /app

COPY package*.json ./

RUN npm install && npm rebuild sqlite3

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]