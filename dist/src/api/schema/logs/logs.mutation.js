import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";
export const logsMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createLogoutLog", {
            type: "logs",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.logs.create({
                    data: {
                        createdAt: new Date(Date.now()),
                        log: "Logout",
                        User: {
                            connect: {
                                userID
                            }
                        }
                    }
                });
            }
        });
    },
});
