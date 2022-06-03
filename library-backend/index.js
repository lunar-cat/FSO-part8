require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const express = require('express');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch((e) => console.log('error connecting to MongoDB:', e.message));

async function startApolloServer(typeDefs, resolvers) {
  const getUser = async (auth) => {
    if (!auth) return null;
    const isBearer = auth.toLowerCase().startsWith('bearer');
    if (isBearer) {
      const encodedToken = auth.substring(7);
      const decodedToken = jwt.verify(encodedToken, JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return currentUser;
    }
  };
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  // Express && HTTP
  const app = express();
  const httpServer = http.createServer(app);

  // WS
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/'
  });
  const serverCleanup = useServer({ schema }, wsServer);

  // Apollo
  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        //eslint-disable-next-line
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          };
        }
      }
    ],
    context: async ({ req }) => {
      const currentUser = await getUser(req.headers.authorization);
      return { currentUser };
    }
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/' });
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
}

startApolloServer(typeDefs, resolvers);
