import { extendType, idArg, nonNull } from "nexus";
import { prisma } from "../../../server.js";


export const companyMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("createCompanyDetails", {
            type: "company",
            args: { companyID: nonNull(idArg()), address: "addressInput" },
            resolve: async (_, { companyID, address: { street, city, province, zipcode } }): Promise<any> => {

                const company = await prisma.company.findUnique({
                    where: {
                        companyID
                    },
                    include: {
                        companyAddress: true,
                        User: true
                    }
                })


                await prisma.logs.create({
                    data: {
                        log: "Company address updated",
                        createdAt: new Date(Date.now()),
                        User: {
                            connect: {
                                userID: company.User[ 0 ].userID
                            }
                        }
                    }
                })

                return await prisma.company.update({
                    data: {
                        companyAddress: {
                            create: {
                                city, province, street, zipcode
                            }
                        },

                    },
                    where: {
                        companyID
                    }
                })
            }

        })
        t.field("updateCompanyAddress", {
            type: "address",
            args: { companyID: nonNull(idArg()), address: "addressInput" },
            resolve: async (_, { companyID, address: { zipcode, city, province, street } }): Promise<any> => {

                const company = await prisma.company.findUnique({
                    where: { companyID },
                    include: {
                        companyAddress: true
                    }
                })
                return await prisma.address.update({
                    data: {
                        zipcode, city, province, street
                    },
                    where: {
                        addressID: company.companyAddress[ 0 ].addressID
                    }
                })
            }
        })
    }
})