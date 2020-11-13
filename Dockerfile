FROM node:alpine AS builder
WORKDIR /workpi
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /workpi
COPY --from=builder /workpi ./
EXPOSE 4000
CMD ["npm", "run", "start:prod"]