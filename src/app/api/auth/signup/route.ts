"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateId } from "lucia";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const userId = generateId(16);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        id: userId,
        email,
        username,
        hashed_password: hashedPassword,
      },
    });

    const session = await auth.createSession(userId, {});
    const sessionCookie = auth.createSessionCookie(session.id);

    const responseHeaders = new Headers();
    responseHeaders.append("Set-Cookie", sessionCookie.serialize());

    return new NextResponse(JSON.stringify({ userId }), {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error during signup:", error);

    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
  }
}
