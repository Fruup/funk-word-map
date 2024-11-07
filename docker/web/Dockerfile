FROM oven/bun:latest AS builder

WORKDIR /work

ADD web/package.json web/bun.lockb ./web/
RUN cd web && bun install --frozen-lockfile

ADD data ./data
ADD web ./web
RUN cd web && bun run build

FROM oven/bun:latest AS dev

WORKDIR /work/web

ADD docker/web/entrypoint.sh /bin/entrypoint.sh
RUN chmod +x /bin/entrypoint.sh

CMD ["/bin/entrypoint.sh"]

FROM oven/bun:latest AS production

WORKDIR /work

COPY --from=builder /work/web/build ./
RUN bun install --production

CMD ["bun", "run", "./index.js"]
