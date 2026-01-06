FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Railway volumes are mounted as root. Running as root avoids EACCES when the
# service needs to create/write auth files inside the mounted volume.
USER root

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the bot code
COPY . .

# Start the bot
CMD [ "sh", "-c", "mkdir -p /usr/src/app/.wwebjs_auth && chmod -R 777 /usr/src/app/.wwebjs_auth && node puppeteer_whatsapp_bot.js" ]
