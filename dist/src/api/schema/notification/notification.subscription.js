import { idArg, nonNull, subscriptionField } from "nexus";
import { pubsub } from "../../../server.js";
export const notificationSubscription = subscriptionField("notificationSubscriptions", {
    type: "notification",
    args: {
        userID: nonNull(idArg())
    },
    subscribe: async () => {
        return await pubsub.asyncIterator("createNotification");
    },
    resolve: async (payload, { userID }) => {
        return payload.userID;
    }
});
