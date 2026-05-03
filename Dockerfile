FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
 # Prevent Puppeteer from downloading Chromium in CI/build environment
 ENV PUPPETEER_SKIP_DOWNLOAD=true
 RUN npm ci

COPY . ./
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]