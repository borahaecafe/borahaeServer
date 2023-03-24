import { extendType, idArg, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";


export const productQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllProducts", {
            type: "products",
            resolve: async (): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        status: "approved"
                    }
                })
            }
        })
        t.list.field("getProductID", {
            type: "products",
            args: { productID: nonNull(idArg()) },
            resolve: async (_, { productID }): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        productID
                    }
                })
            }
        })

        t.list.field("getProductsByUser", {
            type: "products",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        Company: {
                            some: {
                                userID
                            }
                        }
                    }
                })
            }
        })

        t.list.field("getCompanyProducts", {
            type: "products",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        Company: {
                            some: {
                                userID
                            }
                        }
                    }
                })
            }
        })
        t.list.field("getSearchSKU", {
            type: "products",
            args: { sku: nonNull(stringArg()), userID: nonNull(idArg()) },
            resolve: async (_, { sku, userID }): Promise<any> => {

                return await prisma.product.findMany({
                    where: {
                        Company: {
                            some: {
                                userID
                            }
                        },
                        sku: {
                            contains: sku,
                            mode: "insensitive"
                        },

                        status: "approved",

                    },

                })
            }
        })
        t.list.field("getSearchProduct", {
            type: "products",
            args: { sku: nonNull(stringArg()), userID: nonNull(idArg()) },
            resolve: async (_, { sku, userID }: any): Promise<any> => {

                return await prisma.product.findMany({
                    where: {
                        Company: {
                            some: {
                                userID
                            }
                        },
                        title: {
                            contains: sku,
                            mode: "insensitive"
                        },

                        status: "approved",

                    },

                })

            }

        })
        t.list.field("getProductByVendor", {
            type: "products",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                return await prisma.product.findMany({
                    where: {
                        userID,
                        status: "approved"
                    }
                })
            }
        })
        t.list.field("getProductTotal", {
            type: "order",
            args: { productID: nonNull(idArg()) },
            resolve: async (_, { productID }): Promise<any> => {
                return await prisma.order.findMany({
                    where: {
                        Product: {
                            some: {
                                productID
                            }
                        }
                    }
                })
            }
        })

        t.list.field("getProductByGroup", {
            type: "productCount",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                const products = await prisma.product.groupBy({
                    by: [ "title" ],
                    where: {
                        Company: {
                            some: {
                                userID
                            }
                        }
                    },
                    _avg: {
                        price: true
                    },
                    take: 5,
                    orderBy: {
                        title: "desc"
                    }
                })

                return products.map(({ _avg, title }) => {
                    return { count: _avg.price, title: title }
                })
            }
        })
    },
})