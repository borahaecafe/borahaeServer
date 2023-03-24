import { objectType } from "nexus";
import { prisma } from "../../../server.js";



export const orderObject = objectType({
    name: "order",
    definition(t) {
        t.id("orderID");
        t.int("quantity");
        t.string("payment");
        t.string("status")
        t.float("total");
        t.int("discount");
        t.datetime("createdAt")
        t.list.field("orderedProduct", {
            type: "products",
            resolve: async (parent): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        order: {
                            some: {
                                orderID: parent.orderID
                            }
                        }
                    }
                })
            }
        })
        t.list.field("orderedUser", {
            type: "user",
            resolve: async (parent): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Order: {
                            some: {
                                orderID: parent.orderID
                            }
                        }
                    }
                })
            }
        })
    }
})

export const orderPerMonth = objectType({
    name: "orderPerMonth",
    definition(t) {
        t.date("date")
        t.int("total")
    },
})

export const charOrder = objectType({
    name: "ordergraph",
    definition(t) {
        t.id("orderID");
        t.int("quantity");
        t.string("payment");
        t.string("status")
        t.float("total");
        t.date("createdAt")
        t.list.field("orderedProduct", {
            type: "products",
            resolve: async (parent): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        order: {
                            some: {
                                orderID: parent.orderID
                            }
                        }
                    }
                })
            }
        })
    },
})