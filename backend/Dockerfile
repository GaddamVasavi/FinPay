FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema first for generation
COPY prisma ./prisma/
COPY backend/package*.json ./backend/
COPY package*.json ./

RUN npm install
RUN cd backend && npm install

COPY backend ./backend
RUN npx prisma generate
RUN cd backend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
