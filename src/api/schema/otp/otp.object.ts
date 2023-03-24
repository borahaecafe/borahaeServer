import { objectType } from "nexus";


export const otpobject = objectType({
    name: "otp",
    definition(t) {
        t.id("otID");
        t.string("otp");
        t.datetime("createdAt");
        t.datetime("expiredAt")
    }
})