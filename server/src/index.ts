require("dotenv").config();
import "reflect-metadata";
import express from "express";
import http from 'http';
import { AppDataSource } from "./data-source";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { UserResolver } from "./resolvers/user";
const port = process.env.PORT || 4000;

const main = async () => {
  await AppDataSource.initialize();
  const app = express();
  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [HelloResolver, UserResolver], validate: false }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({app})
  httpServer.listen(port, () => console.log(`App is listening on port ${port}. GraphQL server is started on port: localhost:${port}${apolloServer.graphqlPath}`));
};

main().catch((err) => console.log(err));
