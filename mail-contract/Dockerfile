FROM node:latest

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 3000

CMD ["node", "main.js"]