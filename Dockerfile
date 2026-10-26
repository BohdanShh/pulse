# 1. Build: all dependencies (including dev) + compile TypeScript into dist/
FROM oven/bun:1.3.11 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# 2. Production dependencies only, without the Nest CLI, drizzle-kit, TypeScript etc.
FROM oven/bun:1.3.11 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 3. Runtime: Node runs the compiled app; the build tools stay in the previous stages
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
# package.json is needed at runtime for "type": "module"
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
