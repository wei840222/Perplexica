# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.20-debian AS builder
WORKDIR /usr/src/app

# skip optional deps (e.g. sharp) to speed up install
ENV npm_config_optional=false
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# then copy all (non-ignored) project files into the image
COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js drizzle.config.ts tailwind.config.ts ./
COPY src ./src
COPY messages ./messages
COPY drizzle ./drizzle
COPY data ./data
COPY public ./public
COPY uploads ./uploads

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build
RUN bun build ./src/lib/db/migrate.ts --compile --outfile migrate

# copy entrypoint
COPY entrypoint.sh ./entrypoint.sh

# copy production dependencies and source code into final image
FROM oven/bun:1.2.20-slim
WORKDIR /home/perplexica

# update ca-certificates
RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

USER bun

COPY --from=builder --chown=bun:bun /usr/src/app/public ./public
COPY --from=builder --chown=bun:bun /usr/src/app/.next/static ./public/_next/static

COPY --from=builder --chown=bun:bun /usr/src/app/.next/standalone ./
COPY --from=builder --chown=bun:bun /usr/src/app/data ./data
COPY --from=builder --chown=bun:bun /usr/src/app/drizzle ./drizzle
COPY --from=builder --chown=bun:bun /usr/src/app/migrate ./migrate
COPY --from=builder --chown=bun:bun /usr/src/app/uploads ./uploads

COPY --from=builder --chown=bun:bun /usr/src/app/entrypoint.sh ./entrypoint.sh

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "./entrypoint.sh" ]