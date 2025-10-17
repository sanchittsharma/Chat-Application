FROM node:latest

COPY . /home/app
# Create app directory
WORKDIR  /home/app

RUN npm install
# Expose the app port
EXPOSE 1002

# Start the app
CMD ["node", "index.js"]