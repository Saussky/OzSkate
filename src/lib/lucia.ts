import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const auth = new Lucia(adapter, {
  // sessionCookie: {
  //   attributes: {
  //     secure: process.env.NODE_ENV === "production",
  //   },
  // },
  sessionCookie: {
    attributes: {
        secure: false,
        sameSite: "lax",
    },
  },
  sessionExpiresIn: new TimeSpan(1, "w"), // 1 week
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
  }
}
