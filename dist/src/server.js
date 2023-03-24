import { ApolloServer } from "@apollo/server";
import { makeSchema } from 'nexus/dist/makeSchema.js';
import { createServer } from "http";
import { expressjwt } from 'express-jwt';
import { expressMiddleware } from "@apollo/server/express4";
import { WebSocketServer } from 'ws';
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { join } from 'path';
import { PrismaClient } from '@prisma/client/index.js';
import { PubSub } from "graphql-subscriptions/dist/pubsub.js";
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import authorization from 'nexus';
const { fieldAuthorizePlugin, declarativeWrappingPlugin } = authorization;
import express from 'express';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
export const prisma = new PrismaClient();
export const pubsub = new PubSub();
dotenv.config();
const { json } = bodyParser;
import { useServer } from "graphql-ws/lib/use/ws";
import * as Users from './api/schema/user/user.js';
import * as Product from './api/schema/product/product.js';
import * as Profile from './api/schema/profile/profile.js';
import * as Order from './api/schema/order/order.js';
import * as Logs from './api/schema/logs/logs.js';
import * as Notification from './api/schema/notification/notification.js';
import * as Company from './api/schema/company/company.js';
import * as Request from './api/schema/request/request.js';
import * as OTP from './api/schema/otp/otp.js';
async function startApolloServer() {
    const app = express();
    const httpServer = createServer(app);
    app.use(cookieParser());
    app.use(expressjwt({
        algorithms: ["HS256", "HS512"],
        secret: "companyName",
        clockTimestamp: new Date().getTime(),
        credentialsRequired: false
    }));
    app.use(graphqlUploadExpress());
    const schema = makeSchema({
        types: [Users, Product, Profile, Order, Logs, Notification, Company, Request, OTP],
        outputs: {
            schema: join(process.cwd(), "/src/api/generated/system.graphql"),
            typegen: join(process.cwd(), "/src/api/generated/system.ts"),
        },
        plugins: [fieldAuthorizePlugin(), declarativeWrappingPlugin()]
    });
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql'
    });
    const serverCleanup = useServer({ schema }, wsServer);
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ]
    });
    await server.start();
    app.use("/graphql", cors({
        origin: ["http://localhost:3000", "https://studio.apollographql.com"],
        credentials: true,
    }), json(), expressMiddleware(server, {
        context: async ({ req, res }) => ({ req, res }),
    }));
    await new Promise((resolve) => {
        httpServer.listen({ port: process.env.PORT || 4000 }, resolve);
        console.log(`Relaunching Server... Listening on port 4000`);
    });
}
startApolloServer();
