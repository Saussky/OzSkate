"use server"
import { NextApiResponse } from "next";
import { serialize } from "cookie";
import { auth } from "./lucia";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

export async function setSessionCookie(
  res: NextApiResponse,
  token: string,
  expiresAt: Date
) {
  const cookie = serialize("session", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  res.setHeader("Set-Cookie", cookie);
}

export async function deleteSessionCookie(res: NextApiResponse) {
  const cookie = serialize("session", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  res.setHeader("Set-Cookie", cookie);
}

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
    const { user: sessionUser, session } = await auth.validateSession(sessionId);

    if (!sessionUser) {
      return { user: null, session: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        admin: true,
      },
    });

    if (!user) {
      console.error('Lucia found user but Prisma did not')
      return { user: null, session: null };
    }

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