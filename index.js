const express = require('express');
const { createYoga, createSchema } = require('graphql-yoga');
const { PubSub } = require('graphql-subscriptions');
const { readFileSync } = require('fs');
const { join } = require('path');

const TOPIC = 'MESSAGES';
const PORT = process.env.PORT || 1234;

const pubSub = new PubSub();
const typeDefs = readFileSync(join(__dirname, 'schema.gql'), 'utf-8');

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      sendMessage: (_, { message }) => {
        console.log(message);
        pubSub.publish(TOPIC, message);
        return message;
      },
    },
    Subscription: {
      messages: {
        subscribe: () => pubSub.asyncIterator(TOPIC),
        resolve: (x) => x,
      },
    },
  },
});

const app = express();

app
  .use(express.static('public'))
  .use('/graphql', createYoga({ schema }))
  .listen(PORT);
