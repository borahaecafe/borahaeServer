import { subscriptionField } from 'nexus'
import { prisma, pubsub } from '../../../server.js'



export const productCreatsub = subscriptionField("createProductSub", {
    type: "products",
    subscribe: async(): Promise<any> =>{
        return await pubsub.asyncIterator("createProduct");
    },
    resolve: async(payload): Promise<any> => {
        return payload
    }
})