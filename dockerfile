# create image from LTS node
FROM node:latest

# Create app directory
WORKDIR /spotifycontrol

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
