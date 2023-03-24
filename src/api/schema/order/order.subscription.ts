import { idArg, nonNull, subscriptionField } from "nexus";
import { pubsub } from "../../../server.js";


export const orderSubscription = subscriptionField("userOrderSubscription", {
    type: "order",
    args: { userID: nonNull(idArg()) },
    subscribe: async (): Promise<any> => {
        return await pubsub.asyncIterator("createOrderSub");
    },
    resolve: async (payload: any, { userID }): Promise<any> => {
        return payload.userID
    }
})  