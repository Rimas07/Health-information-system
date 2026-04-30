FROM node:18-alpine

WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Install backend deps and build
COPY His/package*.json ./His/
RUN npm ci --prefix His

COPY His/ ./His/
RUN npm run build --prefix His

ENV PORT=3000
EXPOSE 3000

CMD ["node", "His/dist/main.js"]
