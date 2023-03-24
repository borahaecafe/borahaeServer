import { subscriptionField } from 'nexus';
import { pubsub } from '../../../server.js';
export const productCreatsub = subscriptionField("createProductSub", {
    type: "products",
    subscribe: async () => {
        return await pubsub.asyncIterator("createProduct");
    },
    resolve: async (payload) => {
        return payload;
    }
});
