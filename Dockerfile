FROM debian:latest

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential chromium nodejs npm ca-certificates

RUN npm install -g bun

# Install node modules
COPY --link package.json .
RUN bun install

# Copy application code
COPY --link . .

# Build application
RUN bun run build

# Start the server by default, this can be overwritten at runtime
CMD [ "bun", "run", ".output/server/index.mjs" ]
