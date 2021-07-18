from node:lts-slim
RUN mkdir /code
COPY package.json /code/
WORKDIR /code
RUN npm install
COPY server.js /code/
EXPOSE 3000 
CMD ["node", "server.js"]