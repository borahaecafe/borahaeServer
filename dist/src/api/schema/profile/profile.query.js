import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";
export const profileQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getProfileById", {
            type: "profile",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.profile.findMany({
                    where: {
                        userID
                    }
                });
            }
        });
    },
});
