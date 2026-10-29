FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY client client
COPY shared shared
COPY server server
# uid 1000 : le même que l'utilisateur hôte habituel, pour écrire dans saves/ monté depuis l'hôte.
USER node
EXPOSE 3000
CMD ["node", "server/index.js"]
