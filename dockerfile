# Usa una imagen oficial de Node.js
FROM node:18

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json e instala las dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Exponer el puerto 5173 (Vite usa este puerto por defecto)
EXPOSE 5173

# Configurar Vite para que escuche en todas las interfaces de red
ENV VITE_HOST=0.0.0.0
ENV HOST=0.0.0.0

# Comando para iniciar la aplicación y mantener el proceso activo
CMD ["sh", "-c", "exec npm run dev"]
