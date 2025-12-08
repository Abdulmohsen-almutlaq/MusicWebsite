FROM node:18-alpine

WORKDIR /app

# Install dependencies for Prisma (OpenSSL) and ffmpeg
RUN apk add --no-cache openssl ffmpeg

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Ensure DB push happens on start
CMD ["sh", "-c", "npx prisma db push && npm start"]
