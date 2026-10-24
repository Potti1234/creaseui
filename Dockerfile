FROM node:26.12.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.30.6-alpine AS runtime

RUN apk upgrade --no-cache \
    && apk add --no-cache "brotli-libs>=1.2.1"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
