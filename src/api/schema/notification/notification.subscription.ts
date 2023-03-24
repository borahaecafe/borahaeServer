import { idArg, nonNull, subscriptionField, subscriptionType } from "nexus";
import { pubsub } from "../../../server.js";


export const notificationSubscription = subscriptionField("notificationSubscriptions", {
    type: "notification",
    args: {
        userID: nonNull(idArg())
    },
    subscribe: async (): Promise<any> => {
        return await pubsub.asyncIterator("createNotification")
    },
    resolve: async (payload: any, { userID }): Promise<any> => {
        return payload.userID
    }
})