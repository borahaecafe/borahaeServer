import { subscriptionField } from "nexus";
import { pubsub } from "../../../server.js";
export const userSubscriptions = subscriptionField("UserSubscriptions", {
    type: "user",
    subscribe: async () => {
        return await pubsub.asyncIterator("createUserSubscriptions");
    },
    resolve: async (payload) => {
        return await payload;
    }
});
