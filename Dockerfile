# ─────────────────────────────────────────────
# 🌸 Miara — Dockerfile (Ultimate Edition)
# by MidKnightMantra × GPT-5 — 2025
# Lightweight • Secure • Multimedia-Ready
# ─────────────────────────────────────────────

# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install core utilities + ffmpeg + yt-dlp + fonts + Chromium deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        wget \
        curl \
        ca-certificates \
        fonts-noto-color-emoji \
        libnss3 \
        libxss1 \
        libasound2 \
        libx11-xcb1 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxcomposite1 \
        libxrandr2 \
        libgbm1 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libxshmfence1 \
        chromium && \
    # Install latest yt-dlp binary directly (no Python)
    wget -q https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests first (cache layer)
COPY package*.json ./

# Install node dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY . .

# Create required folders
RUN mkdir -p session src/database logs tmp storage/audio

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Health check (optional)
HEALTHCHECK CMD node -e "http.get('http://localhost:3000',r=>process.exit(0)).on('error',()=>process.exit(1))" || exit 1

# Expose port
EXPOSE 3000

# Start Miara
CMD ["npm", "start"]
