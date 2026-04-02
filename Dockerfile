FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build React app
RUN npm run build

# Expose single port
EXPOSE 3001

# Run only Express server
CMD ["node", "server/index.js"]