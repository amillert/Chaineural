FROM node:10.18.0
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD ["sh", "-c","node dist/gateway.js"]