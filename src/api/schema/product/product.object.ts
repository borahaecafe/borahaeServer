import { asNexusMethod, objectType } from 'nexus'
import { prisma } from '../../../server.js';

export const productObject = objectType({
    name: "products",
    definition(t) {
        t.id("productID");
        t.string("title");
        t.string("sku");
        t.int("price");
        t.int("stock");
        t.string("status")
        t.date("createdAt");
        t.list.field("orders", {
            type: "order",
            resolve: async (parent): Promise<any> => {
                return await prisma.order.findMany({
                    where: {
                        Company: {
                            Product: {
                                some: {
                                    productID: parent.productID
                                }
                            }
                        }
                    }
                })
            }
        })
        t.list.field("company", {
            type: "company",
            resolve: async (parent): Promise<any> => {
                return await prisma.company.findMany({
                    where: {
                        Product: {
                            some: {
                                productID: parent.productID
                            }
                        }
                    }
                })
            }
        })
        t.list.field("user", {
            type: "user",
            resolve: async (parent): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Products: {
                            some: {
                                productID: parent.productID
                            }
                        }
                    }
                })
            }
        })
    }
})


export const productCount = objectType({
    name: "productCount",
    definition(t) {
        t.int("count");
        t.string("title")
    },
})