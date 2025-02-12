# Usa una imagen oficial de Node.js
FROM node:18

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json e instala TODAS las dependencias (incluyendo devDependencies)
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construir la aplicación Vite
RUN npm run build

# Exponer el puerto 4173 (Vite Preview usa este puerto por defecto)
EXPOSE 4173

# Configurar Vite para que escuche en todas las interfaces de red
ENV VITE_HOST=0.0.0.0
ENV HOST=0.0.0.0
ENV PORT=4173

# Iniciar la aplicación en modo producción con preview en el puerto 4173
CMD ["sh", "-c", "exec npm run preview -- --host 0.0.0.0 --port 4173"]
