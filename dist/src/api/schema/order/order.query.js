import { extendType, idArg, intArg, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";
export const orderQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllOrders", {
            type: "order",
            args: { start: nonNull(stringArg()), end: nonNull(stringArg()) },
            resolve: async (_, { start, end }) => {
                return await prisma.order.findMany({
                    where: {
                        createdAt: {
                            lte: new Date(end),
                            gte: new Date(start)
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
            }
        });
        t.list.field("getCurrentOrderHistory", {
            type: "order",
            args: { start: nonNull(stringArg()) },
            resolve: async (_, { start }) => {
                return await prisma.order.findMany({
                    where: {
                        createdAt: {
                            gte: new Date(start)
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
            }
        });
        t.list.field("groupOrdersByDate", {
            type: "order",
            args: { userID: nonNull(idArg()), start: nonNull(stringArg()), end: nonNull(stringArg()) },
            resolve: async (_, { userID, start, end }) => {
                const orders = await prisma.order.findMany({
                    where: {
                        userID,
                        createdAt: {
                            lte: new Date(end),
                            gte: new Date(start)
                        },
                    },
                });
                return orders;
            }
        });
        t.list.field("getOrderID", {
            type: "order",
            args: { orderID: nonNull(idArg()) },
            resolve: async (_, { orderID }) => {
                return await prisma.order.findUnique({
                    where: {
                        orderID
                    }
                });
            }
        });
        t.list.field("getAllTransactionByCompany", {
            type: "order",
            args: { userID: nonNull(idArg()), start: stringArg(), end: stringArg() },
            resolve: async (_, { userID, start, end }) => {
                const companies = await prisma.company.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                });
                const orders = await prisma.order.findMany({
                    where: {
                        companyID: companies[0].companyID,
                        createdAt: {
                            gte: new Date(start),
                            lte: new Date(end)
                        },
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
                return orders;
            }
        });
        t.list.field("getAllTotalByMonth", {
            type: "orderPerMonth",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                let date = new Date();
                const orders = await prisma.$queryRawUnsafe(`select DATE_TRUNC('month', public.order."createdAt"), sum("total") from public."order"
                WHERE "userID" = '${userID}' AND "status" = 'approved'
				AND "createdAt" > '${date.toJSON().slice(0, 7)}-01'
                GROUP by DATE_TRUNC('month', public.order."createdAt") `);
                return orders.map(({ date_trunc, sum }) => {
                    return { date: date_trunc, total: sum };
                });
            }
        });
        t.list.field("getLimitedTransaction", {
            type: "order",
            args: { userID: nonNull(idArg()), limit: nonNull(intArg()), offset: nonNull(intArg()) },
            resolve: async (_, { userID, limit, offset }) => {
                const companies = await prisma.company.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                });
                const orders = await prisma.order.findMany({
                    where: {
                        companyID: companies[0].companyID,
                    },
                    take: limit, skip: offset,
                    orderBy: {
                        createdAt: "desc"
                    }
                });
                return orders;
            }
        });
        t.list.field("getTotalRevenue", {
            type: "order",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                const companies = await prisma.company.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                });
                const orders = await prisma.order.findMany({
                    where: {
                        companyID: companies[0].companyID,
                        NOT: {
                            status: "refund"
                        }
                    }
                });
                return orders;
            }
        });
        t.list.field("getAllTotalOrder", {
            type: "order",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.order.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                });
            }
        });
        t.list.field("getTotalVendorTransaction", {
            type: "order",
            args: { start: nonNull(stringArg()), end: nonNull(stringArg()), userID: nonNull(idArg()) },
            resolve: async (_, { start, end, userID }) => {
                const user = await prisma.user.findUnique({
                    where: { userID }, include: { Company: true }
                });
                return await prisma.order.findMany({
                    where: {
                        companyID: user.Company[0].companyID,
                        createdAt: {
                            lte: new Date(end),
                            gte: new Date(start)
                        }
                    }
                });
            }
        });
    }
});
