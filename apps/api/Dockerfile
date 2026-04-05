FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install
COPY . .
# Build from apps/api so dist/ is always apps/api/dist/ (npm -w cwd can vary by npm version)
RUN npm run prisma:generate -w apps/api && \
    cd apps/api && npx tsc -p tsconfig.build.json && \
    test -f dist/server.js
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=5s --start-period=90s --retries=15 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Start from repo root: explicit path so we never depend on npm workspace cwd for node
CMD ["sh", "-c", "npm run prisma:migrate -w apps/api && npm run prisma:seed -w apps/api && node apps/api/dist/server.js"]
