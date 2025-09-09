# Usa Node oficial en versión estable
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y lock para instalar dependencias
COPY package*.json ./

# Instalamos dependencias (queda en la imagen)
RUN npm install

# Copiamos todo el código (después del install para aprovechar cache)
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando default -> modo desarrollo con ts-node-dev (hot reload)
CMD [ "npm", "run", "dev" ]
