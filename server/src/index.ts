require("dotenv").config();
import "reflect-metadata";
import express from "express";
import http from "http";
import { AppDataSource } from "./data-source";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { UserResolver } from "./resolvers/user";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Context } from "./types/Context";
import { PostResolver } from "./resolvers/post";
const port = process.env.PORT || 4000;

const main = async () => {
  await AppDataSource.initialize();
  const app = express();
  const httpServer = http.createServer(app);
  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_uSERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@cluster0.comsr.mongodb.net/reddit?retryWrites=true&w=majority`;

  await mongoose.connect(mongoUrl);

  console.log("Mongo connected");

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60 * 60, //MaxAge là 1 tiếng
        httpOnly: true, //Không cho JS của front end đọc cookie
        secure: __prod__, //cookie chỉ được đọc trong https
        sameSite: "lax", //Bảo vệ khỏi tấn công CSRF
      },
      secret: process.env.SESSION_SECRET_DEV_PROD as string,
      resave: false,
      saveUninitialized: false, //Không cho lưu session rỗng
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req, res }): Context => ({ req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  httpServer.listen(port, () =>
    console.log(
      `App is listening on port ${port}. GraphQL server is started on port: localhost:${port}${apolloServer.graphqlPath}`
    )
  );
};

main().catch((err) => console.log(err));
