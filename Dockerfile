ARG NODE_IMAGE=node:20.13.1
ARG CADDY_IMAGE=caddy:2.7.5-alpine

FROM $NODE_IMAGE as builder

ARG NODE_SPACE_SIZE=10240
ENV NODE_OPTIONS="--openssl-legacy-provider --max-old-space-size=$NODE_SPACE_SIZE"

ENV PUBLIC_URL "./"

COPY . /ui

WORKDIR /ui

RUN cd /ui && \
	yarn set version berry && \
	yarn config set httpTimeout 600000 && \
 	npm i --force && \
 	npm run build

FROM $CADDY_IMAGE

COPY --from=builder /ui/build /ui/build
COPY --from=builder /ui/Caddyfile /ui/Caddyfile

WORKDIR /ui

EXPOSE 3000

CMD [ "caddy", "run", "--config", "/ui/Caddyfile" ]
