'use server';
import { validateRequest } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function changePassword(currentPassword: string, newPassword: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await bcrypt.compare(currentPassword, dbUser.hashed_password))) {
    throw new Error('Invalid current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { hashed_password: hashedPassword },
  });
}