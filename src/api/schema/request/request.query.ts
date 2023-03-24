import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";



export const requestQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllMyRequest", {
            type: "request",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }): Promise<any> => {
                return await prisma.request.findMany({
                    where: {
                        userID
                    }
                })
            }
        })
    },
})