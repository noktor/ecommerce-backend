FROM node:18-alpine

WORKDIR /app

# Instal·lar pnpm
RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host"]

