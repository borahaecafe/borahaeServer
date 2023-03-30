import { asNexusMethod, objectType } from 'nexus';
import { GraphQLPhoneNumber, GraphQLDate, GraphQLEmailAddress, GraphQLDateTime } from 'graphql-scalars';
import { prisma } from '../../../server.js';
export const DateGQL = asNexusMethod(GraphQLDate, "date");
export const PhoneGQL = asNexusMethod(GraphQLPhoneNumber, "phone");
export const EmailGQL = asNexusMethod(GraphQLEmailAddress, "email");
export const DateTimeGQL = asNexusMethod(GraphQLDateTime, "datetime");
export const userObject = objectType({
    name: "user",
    definition(t) {
        t.id("userID");
        t.email("email");
        t.string("password");
        t.string("role");
        t.date("createdAt");
        t.boolean("locked");
        t.list.field("profile", {
            type: "profile",
            resolve: async (parent) => {
                return await prisma.profile.findMany({
                    where: {
                        userID: parent.userID
                    }
                });
            }
        });
        t.list.field("products", {
            type: "products",
            resolve: async (parent) => {
                return await prisma.product.findMany({});
            }
        });
        t.list.field("notification", {
            type: "notification",
            resolve: async (parent) => {
                return await prisma.notification.findMany({
                    where: {
                        userID: parent.userID,
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
            }
        });
        t.list.field("company", {
            type: "company",
            resolve: async (parent) => {
                return await prisma.company.findMany({
                    where: {
                        userID: parent.userID
                    }
                });
            }
        });
    },
});
export const tokenObject = objectType({
    name: "token",
    definition(t) {
        t.string("token");
    },
});
export const userCount = objectType({
    name: "userCount",
    definition(t) {
        t.int("count");
        t.date("createdAt");
    },
});
