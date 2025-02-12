# Usa una imagen oficial de Node.js
FROM node:18

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json e instala dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Exponer el puerto 5173
EXPOSE 5173

# Configurar Vite para que escuche en todas las interfaces de red
ENV VITE_HOST=0.0.0.0
ENV HOST=0.0.0.0

# Mantener el proceso en foreground para evitar SIGTERM
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5173 --force"]
