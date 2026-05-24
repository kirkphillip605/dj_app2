# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
# Copy the root package files and server package files to leverage caching
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci
COPY prisma ./prisma
COPY server ./server
# Generate prisma client and build server
RUN npx prisma generate && npm run build --prefix server

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/server/package.json ./server/
RUN npm ci --omit=dev
# Copy the generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/server/dist ./server/dist
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
