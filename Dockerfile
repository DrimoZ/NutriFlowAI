FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm i
EXPOSE 4000 5173
CMD ["npm","run","dev"]
