FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --no-fund --no-audit --legacy-peer-deps

COPY . .

EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

CMD ["npm", "start"] 