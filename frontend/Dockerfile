FROM node:23-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
EXPOSE 3000
CMD ["npm", "run", "start"]

# production as the default stage
FROM production