import { extendType, idArg, nonNull, stringArg } from "nexus";
import { prisma } from "../../../server.js";
export const companyQuery = extendType({
    type: "Query",
    definition(t) {
        t.list.field("getAllCompanyUser", {
            type: "company",
            resolve: async () => {
                return await prisma.company.findMany();
            }
        });
        t.list.field("getCompanyID", {
            type: "company",
            args: { companyID: nonNull(idArg()) },
            resolve: async (_, { companyID }) => {
                return await prisma.company.findMany({
                    where: {
                        companyID
                    }
                });
            }
        });
        t.list.field("getCompanyDetails", {
            type: "company",
            args: { userID: nonNull(idArg()) },
            resolve: async (_, { userID }) => {
                return await prisma.company.findMany({
                    where: {
                        User: {
                            userID
                        }
                    }
                });
            }
        });
        t.list.field("getSearchCompany", {
            type: "company",
            args: { search: nonNull(stringArg()) },
            resolve: async (_, { search }) => {
                return await prisma.company.findMany({
                    where: {
                        companyName: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                });
            }
        });
    },
});
