import { objectType } from "nexus";
import { prisma } from "../../../server.js";
export const requestObject = objectType({
    name: "request",
    definition(t) {
        t.id("requestID");
        t.string("message");
        t.string('status');
        t.list.field("user", {
            type: "user",
            resolve: async (parent) => {
                return await prisma.user.findMany({
                    where: {
                        Request: {
                            some: {
                                requestID: parent.requestID
                            }
                        }
                    }
                });
            }
        });
        t.list.field("productRequest", {
            type: "products",
            resolve: async (parent) => {
                return await prisma.product.findMany({
                    where: {
                        request: {
                            some: {
                                requestID: parent.requestID
                            }
                        }
                    }
                });
            }
        });
        t.date("createdAt");
    }
});
