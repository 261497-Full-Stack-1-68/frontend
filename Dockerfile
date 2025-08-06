FROM oven/bun:1.1

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install

COPY . .

RUN bun run build

EXPOSE 6009

CMD ["bun", "run", "start"]