import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";



export const notificationMutaiton = extendType({
    type: "Mutation",
    definition(t) {
        t.field("updateNotificationID", {
            type: "notification",
            args: { notificationID: nonNull(idArg()) },
            resolve: async (_, { notificationID }): Promise<any> => {
                return await prisma.notification.update({
                    data: {
                        notificationStatus: "read"
                    },
                    where: {
                        notificationID
                    }
                })
            }
        })
    },
})