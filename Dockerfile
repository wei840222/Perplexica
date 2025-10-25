# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.1-debian AS builder
WORKDIR /usr/src/app

# skip optional deps (e.g. sharp) to speed up install
ENV npm_config_optional=false
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# then copy all (non-ignored) project files into the image
COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js tailwind.config.ts drizzle.config.ts ./
COPY src ./src
COPY public ./public
COPY data ./data
COPY drizzle ./drizzle

# tests & build
ENV NODE_ENV=production
RUN bun run build
RUN bun build ./src/lib/db/migrate.ts --compile --outfile migrate

# copy production dependencies and source code into final image
FROM oven/bun:1.3.1-slim

# update ca-certificates
RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

USER bun
WORKDIR /home/perplexica
RUN mkdir ./uploads

COPY --from=builder --chown=bun:bun /usr/src/app/public ./public
COPY --from=builder --chown=bun:bun /usr/src/app/.next/static ./public/_next/static
COPY --from=builder --chown=bun:bun /usr/src/app/.next/standalone ./

COPY --from=builder --chown=bun:bun /usr/src/app/data ./data
COPY --from=builder --chown=bun:bun /usr/src/app/drizzle ./drizzle
COPY --from=builder --chown=bun:bun /usr/src/app/migrate ./migrate

COPY --chown=bun:bun entrypoint.sh ./entrypoint.sh

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "./entrypoint.sh" ]
