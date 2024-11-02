FROM oven/bun:latest AS builder

WORKDIR /work

ADD web/package.json web/bun.lockb ./
RUN bun install

ADD data ./data
ADD web ./web
RUN cd web && bun run build

FROM oven/bun:latest AS dev

CMD ["bun", "i", "&&", "bun", "dev"]

FROM oven/bun:latest AS production

WORKDIR /work

COPY --from=builder /work/web/package.json /work/web/bun.lockb ./
RUN bun install --production

COPY --from=builder /work/web/build ./

CMD ["bun", "run", "./index.js"]
