// src/lib/lucia.ts
import { Lucia, TimeSpan } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const auth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  sessionExpiresIn: new TimeSpan(1, "w"), // 1 week
});

export const validateRequest = cache(async () => {
  const sessionId =
    (await cookies()).get(auth.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  try {
    const { user, session } = await auth.validateSession(sessionId);

    if (session && session.fresh) {
      const sessionCookie = auth.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      const sessionCookie = auth.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    return {
      user,
      session,
    };
  } catch (err) {
    console.error("Error validating session or setting cookies:", err);

    return {
      user: null,
      session: null,
    };
  }
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
  }
}
