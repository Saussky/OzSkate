import { prisma } from "./prisma";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(Buffer.from(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  return { id: sessionId, userId, expiresAt };
}

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(Buffer.from(token)));

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } });
    }
    return null;
  }

  // Extend session if less than 15 days remaining
  const halfLife = 1000 * 60 * 60 * 24 * 15;
  if (session.expiresAt.getTime() - Date.now() < halfLife) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpiresAt },
    });
    session.expiresAt = newExpiresAt;
  }

  return session;
}

export async function invalidateSession(sessionId: string) {
  await prisma.session.delete({ where: { id: sessionId } });
}
