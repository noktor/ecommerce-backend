# Dockerfile per a l'aplicació Node.js
FROM node:18-alpine

# Establir directori de treball
WORKDIR /app

# Copiar arxius de configuració
COPY package*.json ./
COPY tsconfig.json ./

# Instal·lar pnpm
RUN npm install -g pnpm

# Instal·lar totes les dependències (incloent devDependencies per ts-node)
RUN pnpm install

# Copiar codi font
COPY src/ ./src/

# Exposar port de l'API
EXPOSE 3000

# Per desenvolupament: usar ts-node directament
# Per producció: compilar primer amb `pnpm run build` i després `pnpm start`
CMD ["pnpm", "run", "dev"]

