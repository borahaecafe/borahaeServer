import { inputObjectType, objectType } from "nexus";



export const addressInput = inputObjectType({
    name: "addressInput",
    definition(t) {
        t.string("city");
        t.string("street");
        t.string("province");
        t.string("zipcode");
    },
})

export const addressObject = objectType({
    name: "address",
    definition(t) {
        t.id("addressID");
        t.string("city");
        t.string("street");
        t.string("province");
        t.string("zipcode")
    }
})