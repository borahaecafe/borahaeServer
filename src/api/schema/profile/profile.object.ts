import { objectType } from "nexus";


export const profileObject = objectType({
    name: "profile",
    definition(t) {
        t.id("profileID");
        t.string("firstname");
        t.string('lastname');
        t.date("birthday");
        t.phone("phone");
    },
})