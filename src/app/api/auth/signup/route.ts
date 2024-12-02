// src/app/api/auth/signup/route.ts
"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import Prisma client
import { auth } from "@/lib/lucia"; // Import Lucia instance
import { generateId } from "lucia"; // To generate user IDs
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate user ID and hash password
    const userId = generateId(16); // 16-character secure ID
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt

    // Create user in the database
    await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
      },
    });

    // Create a session for the new user
    const session = await auth.createSession(userId, {});
    const sessionCookie = auth.createSessionCookie(session.id);

    // Set session cookie in the response
    const responseHeaders = new Headers();
    responseHeaders.append("Set-Cookie", sessionCookie.serialize());

    // Return success response
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
