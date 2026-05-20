# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build:backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies for smaller runtime image.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend output.
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

EXPOSE 5000
CMD ["node", "apps/backend/dist/server.js"]
