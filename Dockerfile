# ==================================
# Build Stage
# ==================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
# RUN npm install -g pnpm
RUN corepack enable

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema for generation
COPY prisma ./prisma/

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm run prisma:generate && pnpm run build

# Prune dev dependencies for smaller production image
# RUN pnpm prune --prod
RUN pnpm prune --prod --ignore-scripts

# ==================================
# Production Stage
# ==================================
FROM node:22-alpine AS production

WORKDIR /app

ENV HUSKY=0

RUN corepack enable


# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy only necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3001

# Start command
CMD ["node", "dist/main.js"]
