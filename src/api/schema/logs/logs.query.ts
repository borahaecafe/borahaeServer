import { extendType, idArg, intArg, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";

export const logsQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getUserLog", {
            type: "logs",
            args: { userID: nonNull(idArg()), first: nonNull(intArg()), offset: nonNull(intArg()) },
            resolve: async (_, { userID, first, offset }): Promise<any> => {
                return await prisma.logs.findMany({
                    take: first,
                    where: {
                        User: {
                            Logs: {
                                some: {
                                    userID
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip: offset
                })
            }
        })
    },
})