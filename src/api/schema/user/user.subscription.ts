import { subscriptionField } from "nexus";
import { pubsub } from "../../../server.js";

export const userSubscriptions = subscriptionField("UserSubscriptions", {
    type: "user",
    subscribe: async (): Promise<any> => {
        return await pubsub.asyncIterator("createUserSubscriptions")
    },
    resolve: async (payload): Promise<any> => {
        return await payload
    }
})