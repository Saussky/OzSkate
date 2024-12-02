"use server";
import { NextApiRequest, NextApiResponse } from "next";
import auth from "../../../lib/lucia";
import { prisma } from "../../../lib/prisma";
import { setSessionCookie } from "../../../lib/cookies";
import { createSession } from "../../../lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    const origin = req.headers.origin;
    if (!origin || origin !== process.env.NEXT_PUBLIC_SITE_URL) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await auth.hash.validate(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = auth.generateSessionToken();
    const session = await createSession(token, user.id);

    setSessionCookie(res, token, session.expiresAt);

    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}
