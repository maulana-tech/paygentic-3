FROM node:20-alpine
RUN apk add --no-cache wget
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "8080"]
