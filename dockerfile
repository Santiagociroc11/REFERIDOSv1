# Usa una imagen oficial de Node.js
FROM node:18

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json e instala las dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en desarrollo
CMD ["npm", "run", "dev"]
