import { idArg, nonNull, subscriptionField } from "nexus";
import { pubsub } from "../../../server.js";
export const orderSubscription = subscriptionField("userOrderSubscription", {
    type: "order",
    args: { userID: nonNull(idArg()) },
    subscribe: async () => {
        return await pubsub.asyncIterator("createOrderSub");
    },
    resolve: async (payload, { userID }) => {
        return payload.userID;
    }
});
