import { NextApiRequest, NextApiResponse } from "next";
import { invalidateSession } from "../../lib/session";
import { deleteSessionCookie } from "../../lib/cookies";

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

  try {
    const sessionToken = req.cookies.session;
    if (sessionToken) {
      const sessionId = encodeHexLowerCase(sha256(Buffer.from(sessionToken)));
      await invalidateSession(sessionId);
      deleteSessionCookie(res);
    }
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Logout failed" });
  }
}
