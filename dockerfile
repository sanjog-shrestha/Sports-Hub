FROM node:20-alpine 

WORKDIR /usr/src/app 

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev 

# Copy the rest of the app
COPY . . /usr/src/app/

EXPOSE 3000 

CMD [ "npm", "start" ]