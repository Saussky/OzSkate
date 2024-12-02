import { NextApiResponse } from "next";
import { serialize } from "cookie";

export function setSessionCookie(
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

export function deleteSessionCookie(res: NextApiResponse) {
  const cookie = serialize("session", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  res.setHeader("Set-Cookie", cookie);
}
