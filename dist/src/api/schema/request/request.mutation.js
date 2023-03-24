import { extendType, idArg, intArg, list, nonNull, stringArg } from "nexus";
import { prisma, pubsub } from "../../../server.js";
export const requestMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createProductRequest", {
            type: "request",
            args: { vendorID: nonNull(idArg()), productID: nonNull(list(idArg())) },
            resolve: async (_, { vendorID, productID }) => {
                return await prisma.$transaction(async () => {
                    const users = await prisma.user.findMany({
                        where: {
                            role: "administrator"
                        }
                    });
                    const notif = await prisma.notification.create({
                        data: {
                            title: "add a item to your shop",
                            createdAt: new Date(Date.now()),
                            notificationStatus: "unread",
                            User: {
                                connect: {
                                    userID: users[0].userID
                                }
                            }
                        }
                    });
                    const req = await prisma.request.create({
                        data: {
                            Product: {
                                connect: productID.map((prod) => {
                                    return {
                                        productID: prod
                                    };
                                })
                            },
                            User: {
                                connect: {
                                    userID: vendorID,
                                }
                            },
                            notification: {
                                connect: {
                                    notificationID: notif.notificationID,
                                }
                            },
                            status: "waiting",
                            message: "",
                            createdAt: new Date(Date.now())
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            log: "New created request",
                            User: {
                                connect: {
                                    userID: vendorID
                                }
                            },
                            createdAt: new Date(Date.now())
                        }
                    });
                    pubsub.publish("createNotification", notif);
                    return req;
                });
            }
        });
        t.field("updateRequest", {
            type: "request",
            args: { userID: nonNull(idArg()), requestID: nonNull(idArg()), status: nonNull(stringArg()) },
            resolve: async (_, { userID, requestID, status }) => {
                return await prisma.$transaction(async () => {
                    const request = await prisma.request.findUnique({
                        where: {
                            requestID
                        },
                        include: {
                            Product: true
                        }
                    });
                    const notif = await prisma.notification.findUnique({
                        where: {
                            notificationID: request.notificationID
                        }
                    });
                    if (notif.title === "add a item to your shop") {
                        if (status === "approved") {
                            const updateRequest = await prisma.request.update({
                                data: {
                                    status: status,
                                },
                                where: {
                                    requestID
                                }
                            });
                            const users = await prisma.user.findMany({
                                where: {
                                    userID: notif.userID,
                                    role: "administrator"
                                },
                                include: {
                                    Company: true
                                }
                            });
                            await prisma.company.update({
                                where: {
                                    companyID: users[0].Company[0].companyID
                                },
                                data: {
                                    Product: {
                                        connect: request.Product.map(({ productID }) => {
                                            return { productID: productID };
                                        })
                                    }
                                }
                            });
                            await prisma.logs.create({
                                data: {
                                    log: "Update request",
                                    User: {
                                        connect: {
                                            userID
                                        }
                                    },
                                    createdAt: new Date(Date.now())
                                }
                            });
                            return updateRequest;
                        }
                        else {
                            await prisma.request.update({
                                where: {
                                    requestID
                                },
                                data: {
                                    status: "rejected"
                                }
                            });
                            await prisma.logs.create({
                                data: {
                                    log: "Update request",
                                    User: {
                                        connect: {
                                            userID
                                        }
                                    },
                                    createdAt: new Date(Date.now())
                                }
                            });
                        }
                    }
                    if (notif.title === "delete item") {
                        if (status === "approved") {
                            await prisma.request.update({
                                where: { requestID },
                                data: { status: "approved" }
                            });
                            const products = await prisma.product.delete({
                                where: {
                                    productID: request.Product[0].productID
                                }
                            });
                            await prisma.logs.create({
                                data: {
                                    log: "Item Deleted",
                                    User: {
                                        connect: { userID }
                                    },
                                    createdAt: new Date(Date.now())
                                }
                            });
                            return products;
                        }
                        else {
                            await prisma.request.update({
                                where: {
                                    requestID
                                },
                                data: {
                                    status: "rejected"
                                }
                            });
                            await prisma.logs.create({
                                data: {
                                    log: "Update request",
                                    User: {
                                        connect: {
                                            userID
                                        }
                                    },
                                    createdAt: new Date(Date.now())
                                }
                            });
                        }
                    }
                    if (notif.title === "pull-out item") {
                        if (status === "approved") {
                            await prisma.request.update({
                                where: { requestID },
                                data: { status: "approved" }
                            });
                            const users = await prisma.user.findMany({
                                where: {
                                    userID
                                },
                                include: {
                                    Company: true
                                }
                            });
                            const company = await prisma.company.findUnique({
                                where: {
                                    companyID: users[0].Company[0].companyID
                                },
                                include: {
                                    Product: true
                                }
                            });
                            return await prisma.company.update({
                                data: {
                                    Product: {
                                        update: {
                                            data: {
                                                stock: request.Product[0].stock - request.quantity
                                            },
                                            where: {
                                                productID: request.Product[0].productID
                                            }
                                        }
                                    }
                                },
                                where: {
                                    companyID: company.companyID
                                }
                            });
                        }
                        else {
                            return await prisma.request.update({
                                where: { requestID },
                                data: { status: "rejected" }
                            });
                        }
                    }
                    if (notif.title === "re-stock item") {
                        if (status === "approved") {
                            await prisma.request.update({
                                where: {
                                    requestID
                                },
                                data: { status: "approved" }
                            });
                            await prisma.product.update({
                                data: {
                                    stock: request.quantity
                                },
                                where: {
                                    productID: request.Product[0].productID
                                }
                            });
                            await prisma.logs.create({
                                data: {
                                    log: "Update request",
                                    User: { connect: { userID } },
                                    createdAt: new Date(Date.now())
                                }
                            });
                        }
                        else {
                            await prisma.logs.create({
                                data: {
                                    log: "Update request",
                                    User: { connect: { userID } },
                                    createdAt: new Date(Date.now())
                                }
                            });
                            return await prisma.request.update({
                                data: {
                                    status: "rejected",
                                },
                                where: { requestID }
                            });
                        }
                    }
                });
            }
        });
        t.field("deleteProductRequest", {
            type: "request",
            args: { productID: nonNull(idArg()), userID: nonNull(idArg()) },
            resolve: async (_, { userID, productID }) => {
                return await prisma.$transaction(async () => {
                    const userAdmin = await prisma.user.findMany({
                        where: {
                            role: "administrator"
                        },
                        include: {
                            Company: true
                        }
                    });
                    const notif = await prisma.notification.create({
                        data: {
                            title: "delete item",
                            notificationStatus: "unread",
                            createdAt: new Date(Date.now()),
                            User: {
                                connect: {
                                    userID: userAdmin[0].userID
                                }
                            }
                        }
                    });
                    const req = await prisma.request.create({
                        data: {
                            status: "waiting",
                            message: "",
                            User: {
                                connect: { userID }
                            },
                            notification: {
                                connect: {
                                    notificationID: notif.notificationID
                                }
                            },
                            Product: {
                                connect: {
                                    productID
                                }
                            },
                            createdAt: new Date(Date.now())
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            log: "Created a Delete Request",
                            User: {
                                connect: {
                                    userID
                                }
                            },
                            createdAt: new Date(Date.now())
                        }
                    });
                    pubsub.publish("createNotification", notif);
                    return req;
                });
            }
        });
        t.field("pulloutRequest", {
            type: "request",
            args: { userID: nonNull(idArg()), productID: nonNull(idArg()), quantity: nonNull(intArg()) },
            resolve: async (_, { userID, productID, quantity }) => {
                const users = await prisma.user.findMany({
                    where: {
                        role: "administrator"
                    }
                });
                const notification = await prisma.notification.create({
                    data: {
                        title: "pull-out item",
                        notificationStatus: "unread",
                        User: {
                            connect: {
                                userID: users[0].userID
                            }
                        },
                        createdAt: new Date(Date.now())
                    }
                });
                const request = await prisma.request.create({
                    data: {
                        status: "waiting",
                        message: `I want to pull out ${quantity} from this item. `,
                        User: {
                            connect: { userID }
                        },
                        quantity,
                        notification: {
                            connect: {
                                notificationID: notification.notificationID
                            }
                        },
                        Product: {
                            connect: {
                                productID
                            }
                        },
                        createdAt: new Date(Date.now())
                    }
                });
                await prisma.logs.create({
                    data: { log: "Pull-out request", createdAt: new Date(Date.now()), User: { connect: { userID } } }
                });
                pubsub.publish("createNotification", notification);
                return request;
            }
        });
        t.field("restockrequest", {
            type: "request",
            args: { userID: nonNull(idArg()), productID: nonNull(idArg()), stock: nonNull(intArg()) },
            resolve: async (_, { userID, productID, stock }) => {
                const users = await prisma.user.findMany({
                    where: {
                        role: "administrator"
                    }
                });
                const notif = await prisma.notification.create({
                    data: {
                        title: `re-stock item`,
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID: users[0].userID
                            }
                        }
                    }
                });
                const request = await prisma.request.create({
                    data: {
                        User: {
                            connect: {
                                userID
                            }
                        },
                        quantity: stock,
                        status: "waiting",
                        Product: {
                            connect: {
                                productID
                            }
                        },
                        notification: {
                            connect: {
                                notificationID: notif.notificationID
                            }
                        },
                        message: "",
                        createdAt: new Date(Date.now())
                    },
                });
                await prisma.logs.create({
                    data: {
                        log: "re-stock request",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
                pubsub.publish("createNotification", notif);
                return request;
            }
        });
        t.field("requestProduct", {
            type: "request",
            args: { userID: nonNull(idArg()), productID: nonNull(idArg()), quantity: nonNull(intArg()) },
            resolve: async (_, { userID, productID, quantity }) => {
                const prod = await prisma.product.findUnique({
                    where: {
                        productID
                    },
                    include: {
                        User: true
                    }
                });
                const vendorUser = await prisma.user.findMany({
                    where: {
                        userID: prod.userID
                    }
                });
                const notification = await prisma.notification.create({
                    data: {
                        title: "Request a restock",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID: vendorUser[0].userID
                            }
                        }
                    }
                });
                pubsub.publish("createNotification", notification);
                await prisma.logs.create({
                    data: {
                        log: "Create product request",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
                return await prisma.request.create({
                    data: {
                        User: {
                            connect: {
                                userID
                            }
                        },
                        quantity,
                        Product: {
                            connect: {
                                productID
                            }
                        },
                        notification: {
                            connect: {
                                notificationID: notification.notificationID
                            }
                        },
                        status: "waiting",
                        message: `I would like to ask a another ${quantity} stock of ${prod.title}.`,
                        createdAt: new Date(Date.now())
                    }
                });
            }
        });
    },
});
