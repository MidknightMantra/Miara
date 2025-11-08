# ─────────────────────────────────────────────
# 🌸 Miara — Dockerfile
# by MidKnightMantra × GPT-5 — 2025
# Lightweight, Secure, and Auto-Deployable
# ─────────────────────────────────────────────

# Base image with Node 20 (stable LTS)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy all source code
COPY . .

# Create necessary folders
RUN mkdir -p session src/database logs tmp

# Expose port for health server
EXPOSE 3000

# Default environment
ENV NODE_ENV=production
ENV PORT=3000

# Startup command
CMD ["npm", "start"]
