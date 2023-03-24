import { objectType } from "nexus";
import { prisma } from "../../../server.js";


export const notificationObject = objectType({
    name: "notification",
    definition(t) {
        t.id("notificationID");
        t.string("title");
        t.string("notificationStatus");
        t.datetime("createdAt");
        t.list.field("request", {
            type: "request",
            resolve: async (parent): Promise<any> => {
                return await prisma.request.findMany({
                    where: {
                        notificationID: parent.notificationID
                    }
                })
            }
        })
        t.list.field("user", {
            type: "user",
            resolve: async (parent): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Notificaiton: {
                            some: {
                                notificationID: parent.notificationID
                            }
                        }
                    }
                })
            }
        })
        t.list.field("product", {
            type: "products",
            resolve: async (parent): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        notificationID: parent.notificationID
                    }
                })
            }
        })
    },
})