FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

# Dev mode (hot reload). For production, use `npm run build` + `npm start` instead.
CMD ["npm", "run", "dev"]
