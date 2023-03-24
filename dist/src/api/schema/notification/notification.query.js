import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";
export const notificationQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("notificationQuery", {
            type: "notification",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.notification.findMany({
                    where: {
                        userID,
                    }
                });
            }
        });
        t.list.field('getUnreadNotification', {
            type: "notification",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.notification.findMany({
                    where: {
                        User: {
                            userID
                        },
                        notificationStatus: "unread"
                    }
                });
            }
        });
        t.list.field("getUserNotification", {
            type: "user",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.user.findMany({
                    where: {
                        userID,
                    },
                });
            }
        });
        t.list.field("getNotificationID", {
            type: "notification",
            args: { notificationID: nonNull(idArg()) },
            resolve: async (_, { notificationID }) => {
                return await prisma.notification.findMany({
                    where: {
                        notificationID
                    }
                });
            }
        });
    },
});
