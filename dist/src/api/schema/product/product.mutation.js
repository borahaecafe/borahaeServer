import { extendType, idArg, inputObjectType, intArg, nonNull, stringArg } from "nexus";
import { prisma, pubsub } from "../../../server.js";
import { GraphQLError } from "graphql";
import { generateString } from "../../../helper/skugenerator.js";
export const productInput = inputObjectType({
    name: "productInput",
    definition(t) {
        t.string("title");
        t.int("stock");
        t.int("price");
    },
});
export const productMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createProduct", {
            type: "products",
            args: {
                proudct: nonNull("productInput"),
                userID: nonNull(idArg())
            },
            resolve: async (_, { proudct: { price, stock, title }, userID }, { req }) => {
                return await prisma.$transaction(async () => {
                    const user = await prisma.user.findUnique({
                        where: {
                            userID
                        }, include: {
                            Company: true,
                            Profile: true
                        }
                    });
                    const products = await prisma.product.create({
                        data: {
                            title, stock,
                            price,
                            createdAt: new Date(Date.now()),
                            sku: `${user.Profile[0].firstname[0]}${user.Profile[0].lastname[0]}${user.Company[0].companyName[0]}-${generateString(4)}`,
                            Company: {
                                connect: {
                                    companyID: user.Company[0].companyID
                                }
                            },
                            status: "approved",
                            User: {
                                connect: {
                                    userID
                                }
                            }
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            createdAt: new Date(Date.now()),
                            log: "Created Product",
                            User: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    });
                    pubsub.publish("createProduct", products);
                    return products;
                });
            }
        });
        t.field("deleteProduct", {
            type: "products",
            args: { productID: nonNull(idArg()), userID: nonNull(idArg()) },
            resolve: async (_, { productID, userID }) => {
                return await prisma.$transaction(async () => {
                    const user = await prisma.user.findUnique({
                        where: {
                            userID
                        }
                    });
                    if (!user)
                        throw new GraphQLError("No user exist");
                    if (!productID)
                        throw new GraphQLError("Product does not exist.");
                    const product = await prisma.product.delete({
                        where: {
                            productID
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            createdAt: new Date(Date.now()),
                            log: "Deleted Product",
                            User: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    });
                    return product;
                });
            }
        });
        t.field("updateProduct", {
            type: "products",
            args: { title: stringArg(), stock: intArg(), price: nonNull(intArg()), productID: nonNull(idArg()), userID: nonNull(idArg()) },
            resolve: async (_, { title, price, stock, productID, userID }) => {
                return await prisma.$transaction(async () => {
                    const user = await prisma.user.findUnique({
                        where: {
                            userID
                        }
                    });
                    if (!user)
                        throw new GraphQLError("No user exist");
                    const product = prisma.product.update({
                        data: {
                            title, stock, price,
                        },
                        where: {
                            productID
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            createdAt: new Date(Date.now()),
                            log: "Updated Product",
                            User: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    });
                    return product;
                });
            }
        });
    },
});
