// import { NextRequest, NextResponse } from "next/server";
// import { validateSessionToken } from "./lib/session";
// import { setSessionCookie, deleteSessionCookie } from "./lib/cookies";

// export async function middleware(req: NextRequest) {
//   const sessionToken = req.cookies.get("session")?.value;

//   if (req.nextUrl.pathname.startsWith("/protected")) {
//     if (!sessionToken) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const session = await validateSessionToken(sessionToken);

//     if (!session) {
//       const res = NextResponse.redirect(new URL("/login", req.url));
//       deleteSessionCookie(res);
//       return res;
//     }

//     const res = NextResponse.next();
//     setSessionCookie(res, sessionToken, session.expiresAt);
//     return res;
//   }

//   console.log("middleware finished");
//   return NextResponse.next();
// }
