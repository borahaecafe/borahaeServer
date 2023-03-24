import { extendType, idArg, intArg, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";


export const userQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllActiveUser", {
            type: "user",
            resolve: async (): Promise<any> => {
                return await prisma.user.findMany()
            }
        })
        t.list.field("getAllUserByGroup", {
            type: "userCount",
            resolve: async (): Promise<any> => {
                const users = await prisma.user.groupBy({
                    by: [ "createdAt" ],
                    _count: {
                        userID: true
                    }
                })
                return users.map(({ _count, createdAt }) => {
                    return { count: _count.userID, createdAt: createdAt }
                })
            }
        })
        t.list.field("getAllUsers", {
            type: "user",
            args: { limit: nonNull(intArg()), offset: nonNull(intArg()) },
            resolve: async (_, { limit, offset }): Promise<any> => {
                return await prisma.user.findMany({
                    take: limit,
                    skip: offset
                })
            }
        })
        t.list.field("getUserID", {
            type: "user",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        userID
                    }
                })
            }
        })
        t.list.field("searchUserByName", {
            type: "user",
            args: { search: nonNull(stringArg()), limit: nonNull(intArg()), offset: nonNull(intArg()) },
            resolve: async (_, { search, limit, offset }): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Profile: {
                            some: {
                                firstname: {
                                    contains: search,
                                    mode: "insensitive"
                                },


                            }
                        }
                    },
                    take: limit,
                    skip: offset
                })
            }
        })
        t.list.field("getAllAdmin", {
            type: "user",
            resolve: async (): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        role: "administrator"
                    }
                })
            }
        })
    },
})