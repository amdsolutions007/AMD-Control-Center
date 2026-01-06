FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the bot code
COPY . .

# Start the bot
CMD [ "node", "puppeteer_whatsapp_bot.js" ]
