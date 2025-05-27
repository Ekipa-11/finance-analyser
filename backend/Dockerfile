# I have an expressjs app, build it (no comments)
FROM node:23-alpine 
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]