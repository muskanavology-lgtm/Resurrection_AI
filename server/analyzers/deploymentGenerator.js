function deploymentGenerator(
  analysis
) {

  const dockerfile = `
FROM node:20

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm","start"]
`;

  const dockerCompose = `
version: '3'

services:

  app:

    build: .

    ports:
      - "5000:5000"

`;

  const githubActions = `
name: Deploy

on:
  push:
    branches:
      - main

jobs:

  build:

    runs-on:
      ubuntu-latest

    steps:

      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4

      - run: npm install

      - run: npm test
`;

  const kubernetes = `
apiVersion: apps/v1

kind: Deployment

metadata:

  name: app

spec:

  replicas: 2

  selector:

    matchLabels:
      app: app

  template:

    metadata:

      labels:
        app: app

    spec:

      containers:

      - name: app

        image: app:latest

        ports:

        - containerPort: 5000
`;

  return {

    dockerfile,

    dockerCompose,

    githubActions,

    kubernetes

  };

}

module.exports =
deploymentGenerator;