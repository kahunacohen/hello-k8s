from node:lts-slim
RUN mkdir /code
COPY package*.json server.js /code/
WORKDIR /code
RUN npm install
EXPOSE 3000 
CMD ["node", "server.js"]
