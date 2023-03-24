import { objectType } from "nexus";
import { prisma } from "../../../server.js";




export const logsObject = objectType({
    name: "logs",
    definition(t) {
        t.id("logsID");
        t.string("log");
        t.datetime("createdAt")
        t.list.field("user", {
            type: "user",
            resolve: async (parent): Promise<any> => {
                return await prisma.user.findMany({
                    where: {
                        Logs: {
                            some: {
                                logsID: parent.logsID
                            }
                        }
                    }
                })
            }
        })
    }
})
