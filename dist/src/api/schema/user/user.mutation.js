import { booleanArg, extendType, idArg, inputObjectType, nonNull, stringArg } from "nexus";
import { prisma, pubsub } from "../../../server.js";
import jsonwebtoken from 'jsonwebtoken';
const { sign, verify } = jsonwebtoken;
import { GraphQLError } from "graphql";
import bcrypt from 'bcryptjs';
export const userInput = inputObjectType({
    name: "userInput",
    definition(t) {
        t.nonNull.email("email");
    },
});
export const profileInput = inputObjectType({
    name: "profileInput",
    definition(t) {
        t.nonNull.string("firstname");
        t.nonNull.string("lastname");
        t.nonNull.date("birthday");
        t.nonNull.phone("phone");
    },
});
export const userMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createUserAdmin", {
            type: "user",
            args: { Auth: "userInput", Profile: "profileInput", companyName: nonNull(stringArg()) },
            resolve: async (_, { Auth: { email }, Profile: { lastname, firstname, birthday, phone }, companyName }) => {
                const pass = await bcrypt.hash(new Date(birthday).toISOString().slice(0, 10).replaceAll("-", ""), 12);
                return await prisma.$transaction(async () => {
                    const user = await prisma.user.create({
                        data: {
                            email, password: pass, createdAt: new Date(Date.now()),
                            role: "administrator",
                            Profile: {
                                create: {
                                    firstname, lastname, birthday, phone
                                }
                            },
                            Company: {
                                create: {
                                    companyName
                                }
                            }
                        }
                    });
                    pubsub.publish("createUserSubscriptions", user);
                    return user;
                });
            }
        });
        t.field("createUserAccount", {
            type: "user",
            args: { email: "EmailAddress", role: nonNull(stringArg()), Profile: nonNull("profileInput"), companyName: nonNull(stringArg()) },
            resolve: async (_, { email, Profile: { birthday, firstname, lastname, phone }, role, companyName }, { req }) => {
                const pass = await bcrypt.hash(new Date(birthday).toISOString().slice(0, 10).replaceAll("-", ""), 12);
                const token = req.cookies['company_access_token'];
                const { userId } = await verify(token, "compayName");
                const users = await prisma.user.findUnique({
                    where: { userID: userId },
                    include: {
                        Company: true
                    }
                });
                if (role === "administrator") {
                    const user = await prisma.user.create({
                        data: {
                            email, password: pass, createdAt: new Date(Date.now()),
                            Profile: {
                                create: {
                                    birthday,
                                    firstname,
                                    lastname,
                                    phone
                                },
                            },
                            Company: {
                                connect: {
                                    companyID: users.Company[0].companyID
                                }
                            },
                            role: "administrator"
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            log: "New Created Administrator",
                            User: {
                                connect: {
                                    userID: users.userID
                                }
                            },
                            createdAt: new Date(Date.now())
                        }
                    });
                    pubsub.publish("createUserSubscriptions", user);
                    return user;
                }
                if (role === "vendor") {
                    const user = await prisma.user.create({
                        data: {
                            email, password: pass, createdAt: new Date(Date.now()),
                            Profile: {
                                create: {
                                    birthday,
                                    firstname,
                                    lastname,
                                    phone
                                },
                            },
                            Company: {
                                create: {
                                    companyName
                                }
                            },
                            role: "vendor"
                        }
                    });
                    await prisma.logs.create({
                        data: {
                            log: "New Created Vendor",
                            User: {
                                connect: {
                                    userID: users.userID
                                }
                            },
                            createdAt: new Date(Date.now())
                        }
                    });
                    pubsub.publish("createUserSubscriptions", user);
                    return user;
                }
            }
        });
        t.field("login", {
            type: "token",
            args: { email: nonNull(stringArg()), password: nonNull(stringArg()) },
            resolve: async (_, { email, password }, { res }) => {
                return await prisma.$transaction(async () => {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    });
                    if (user.locked)
                        throw new GraphQLError("You account has been locked.");
                    if (!user)
                        throw new GraphQLError("No existing email address");
                    const pass = await bcrypt.compare(password, user.password);
                    if (!pass)
                        throw new GraphQLError("Invalid password. Please Try again");
                    const token = sign({ userId: user.userID, r: user.role, lock: user.locked }, "compayName", {
                        algorithm: "HS512",
                    });
                    await prisma.logs.create({
                        data: {
                            createdAt: new Date(Date.now()),
                            log: "Login",
                            User: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    });
                    res.cookie("company_access_token", token, {
                        httpOnly: false,
                        sameSite: "none",
                        secure: true
                    });
                    return { token };
                });
            }
        });
        t.field("userlockedAccount", {
            type: "user",
            args: { userID: nonNull(idArg()), locked: nonNull(booleanArg()) },
            resolve: async (_, { userID, locked }) => {
                return await prisma.user.update({
                    where: { userID },
                    data: {
                        locked
                    }
                });
            }
        });
        t.field("deleteUserAccount", {
            type: "user",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.user.delete({
                    where: {
                        userID
                    }
                });
            }
        });
        t.field("updateUserPassword", {
            type: "user",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                const user = await prisma.user.findUnique({
                    where: { userID }, include: { Profile: true }
                });
                const pass = await bcrypt.hash(new Date(user.Profile[0].birthday).toISOString().slice(0, 10).replaceAll("-", ""), 12);
                await prisma.logs.create({
                    data: {
                        log: "User Reset password",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
                return await prisma.user.update({
                    where: { userID },
                    data: { password: pass }
                });
            }
        });
        t.field("updateMyPassword", {
            type: "user",
            args: { retype: nonNull(stringArg()), password: nonNull(stringArg()), userID: nonNull(idArg()) },
            resolve: async (_, { password, retype, userID }) => {
                const pass = await bcrypt.hash(password, 12);
                if (retype !== password) {
                    throw new GraphQLError("Password mismatched");
                }
                await prisma.logs.create({
                    data: {
                        log: "Changed Password",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
                return await prisma.user.update({
                    where: {
                        userID
                    },
                    data: {
                        password: pass
                    }
                });
            }
        });
        t.field("updateUserProfile", {
            type: "user",
            args: { userID: nonNull(idArg()), profile: "profileInput" },
            resolve: async (_, { userID, profile: { firstname, birthday, lastname, phone } }) => {
                const user = await prisma.user.findUnique({
                    where: {
                        userID
                    },
                    include: {
                        Profile: true
                    }
                });
                await prisma.logs.create({
                    data: {
                        log: "Updated Profile",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
                return await prisma.user.update({
                    where: {
                        userID
                    },
                    data: {
                        Profile: {
                            update: {
                                data: {
                                    birthday, firstname, lastname, phone
                                },
                                where: {
                                    profileID: user.Profile[0].profileID
                                }
                            }
                        }
                    }
                });
            }
        });
    },
});
