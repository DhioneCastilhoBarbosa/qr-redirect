# ===== STAGE 1: build =====
FROM node:22-alpine AS build

WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm ci

# Copia o código
COPY . .

# Build do Vite
RUN npm run build


# ===== STAGE 2: serve =====
FROM nginx:1.27-alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Config SPA (BrowserRouter)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
