FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

RUN pnpm install

COPY . .

RUN pnpm run prisma:generate

CMD ["pnpm", "start:dev"]
