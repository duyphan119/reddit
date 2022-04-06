import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
   type: "postgres",
   host: "localhost",
   port: 5432,
   username: process.env.DB_USERNAME_DEV,
   password: process.env.DB_PASSWORD_DEV,
   database: "reddit",
   synchronize: true,
   logging: true,
   entities: [User, Post],
   subscribers: [],
   migrations: [],
})