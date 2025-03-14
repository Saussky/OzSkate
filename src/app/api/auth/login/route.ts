"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "No email/username found" },
          { status: 401 }
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);

    const response = NextResponse.json({ userId: user.id, email: user.email, username: user.username });
    response.headers.append("Set-Cookie", sessionCookie.serialize());

    return response;
  } catch (error) {
    console.error("Error during login:", error);

    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
