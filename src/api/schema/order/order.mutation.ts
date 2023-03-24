import { extendType, idArg, inputObjectType, list, nonNull, stringArg } from "nexus";
import { prisma, pubsub } from "../../../server.js";


export const orderInput = inputObjectType({
    name: "orderInput",
    definition(t) {
        t.id("userID");
        t.id("productID");
        t.int("quantity");
        t.int("discount")
        t.string("payment")
    },
})
export const orderMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.list.field("createOrder", {
            type: "order",
            args: { orderses: list("orderInput") },
            resolve: async (_, { orderses }): Promise<any> => {

                return await prisma.$transaction(async () => {
                    return orderses.map((async ({ productID, userID, quantity, payment, discount }) => {



                        const prod = await prisma.product.findUnique({
                            where: {
                                productID
                            },
                            select: {
                                User: true,
                                price: true,
                                stock: true,
                                Company: true
                            }
                        })


                        const users = await prisma.user.findUnique({
                            where: {
                                userID: prod.User.userID
                            },
                            include: {
                                Company: true
                            }
                        })
                        await prisma.product.update({
                            where: { productID },
                            data: { stock: prod.stock - quantity }
                        })

                        const orders = await prisma.order.create({
                            data: {
                                status: "approved",
                                payment,
                                quantity,
                                discount,
                                total: quantity * prod.price - discount,
                                Product: {
                                    connect: {
                                        productID,
                                    },
                                },
                                Company: {
                                    connect: {
                                        companyID: users.Company[ 0 ].companyID
                                    }
                                },
                                User: {
                                    connect: {
                                        userID: users.userID
                                    }
                                }
                            }
                        })

                        await prisma.logs.create({
                            data: {
                                log: "Created a order", createdAt: new Date(Date.now()), User: {
                                    connect: {
                                        userID
                                    }
                                }
                            }
                        })



                        pubsub.publish("createOrderSub", orders)


                        return orders
                    }))
                })
            }
        })
        t.field("updateOrderStatus", {
            type: "order",
            args: { orderID: nonNull(idArg()), status: nonNull(stringArg()) },
            resolve: async (_, { orderID, status }): Promise<any> => {
                const orders = await prisma.order.update({
                    where: { orderID },
                    data: { status: status as any }
                })

                await prisma.logs.create({
                    data: {
                        log: "Update order status", createdAt: new Date(Date.now()), User: {
                            connect: {
                                userID: orders.userID
                            }
                        }
                    }
                })

                return orders
            }
        })
        t.list.field("getAllSales", {
            type: "order",
            args: { userID: nonNull(idArg()), start: nonNull(idArg()), end: nonNull(stringArg()) },
            resolve: async (_, { userID, start, end }): Promise<any> => {
                const companies = await prisma.company.findMany({
                    where: {
                        userID
                    }
                })
                return await prisma.order.findMany({
                    where: {
                        companyID: companies[ 0 ].companyID,
                        createdAt: {
                            gte: new Date(start),
                            lte: new Date(end)
                        },
                    },

                })
            }
        })
        t.list.field("getTotalSales", {
            type: "order",
            args: { userID: nonNull(idArg()), start: nonNull(stringArg()), end: nonNull(stringArg()) },
            resolve: async (_, { userID, start, end }): Promise<any> => {

                const companies = await prisma.company.findMany({
                    where: {
                        userID
                    }
                })
                return await prisma.order.findMany({
                    where: {
                        companyID: companies[ 0 ].companyID,
                        createdAt: {
                            gte: new Date(start),
                            lte: new Date(end)
                        },
                        NOT: {
                            status: "refund"
                        }
                    },

                })
            }
        })
        t.list.field("getRefunded", {
            type: "order",
            args: { userID: nonNull(idArg()), start: nonNull(stringArg()), end: nonNull(stringArg()) },
            resolve: async (_, { userID, start, end }): Promise<any> => {

                const companies = await prisma.company.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                })
                return await prisma.order.findMany({

                    where: {
                        companyID: companies[ 0 ].companyID,
                        createdAt: {
                            gte: new Date(start),
                            lte: new Date(end)
                        },
                        NOT: {
                            status: "approved"
                        }
                    }
                })
            }
        })
    }
})