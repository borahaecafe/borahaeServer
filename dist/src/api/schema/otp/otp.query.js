import { extendType } from "nexus";
import { prisma } from "../../../server.js";
export const otpCRUD = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllOTP", {
            type: "otp",
            resolve: async () => {
                return await prisma.otp.findMany();
            }
        });
    },
});
