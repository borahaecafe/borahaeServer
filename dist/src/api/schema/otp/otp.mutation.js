import { extendType, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";
import generateOTP from "../../../helper/otpgenerator.js";
import { borahaeEmail } from "../../../helper/email.js";
import { GraphQLError } from 'graphql';
export const otpMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createOTP", {
            type: "otp",
            args: { email: nonNull("EmailAddress") },
            resolve: async (_, { email }) => {
                const dates = new Date();
                const usser = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        Profile: true
                    }
                });
                if (!usser)
                    throw new GraphQLError("Email does not exist");
                const otps = await prisma.otp.create({
                    data: {
                        otp: await generateOTP(4).toString(),
                        createdAt: new Date(Date.now()),
                        expiredAt: new Date(dates.getTime() + 5 * 60000)
                    }
                });
                borahaeEmail(`${email}`, `Dear ${usser.Profile[0].firstname} ${usser.Profile[0].lastname}, <br><br>use this One Time Password <b>${otps.otp}</b> to log in to your account. <br>This OTP will be valid for the next 5 mins.<br><br>Regards, <br><br>Borhae Cafe`, "Borahae Cafe OTP");
                return otps;
            }
        });
        t.field("verifyOTP", {
            type: "otp",
            args: { otp: nonNull(stringArg()) },
            resolve: async (_, { otp }) => {
                const ottp = await prisma.otp.findUnique({
                    where: {
                        otp
                    }
                });
                if (ottp?.otp !== otp)
                    throw new GraphQLError("OTP mismatched");
                if (ottp.expiredAt.getTime() < new Date().getTime()) {
                    throw new GraphQLError("Your OTP is expired. Generate new one.");
                }
                return ottp;
            }
        });
    }
});
