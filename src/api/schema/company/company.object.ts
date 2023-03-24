import { objectType } from "nexus";
import { prisma } from "../../../server.js";



export const companyObject = objectType({
    name: "company",
    definition(t) {
        t.id("companyID");
        t.string("companyName");
        t.list.field("companyAddress", {
            type: "address",
            resolve: async (parent): Promise<any> => {
                return await prisma.address.findMany({
                    where: {
                        companyID: parent.companyID
                    }
                })
            }
        })
        t.list.field("user", {
            type: "user",
            resolve: async (parent): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Company: {
                            some: {
                                companyID: parent.companyID
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
                        Company: {
                            some: {
                                companyID: parent.companyID
                            }
                        }
                    }
                })
            }
        })
        t.list.field("orders", {
            type: "order",
            resolve: async (parent): Promise<any> => {
                return await prisma.order.findMany({
                    where: {
                        companyID: parent.companyID,
                        status: "approved"
                    }
                })
            }
        })
    },
})