"use server";
import { prisma } from "@/lib/prisma";

export async function fetchUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, admin: true },
    });
    console.log('users', users)
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function toggleUserAdminStatus(userId: string, currentStatus: boolean) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { admin: !currentStatus },
    });
    console.log(`User ${userId} admin status updated to ${!currentStatus}`);
    return updatedUser;
  } catch (error) {
    console.error("Error toggling admin status:", error);
    throw error;
  }
}
