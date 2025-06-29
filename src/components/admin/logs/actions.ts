'use server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchLogs(): Promise<any[]> {
  // Fetch all logs, latest first
  const logs = await prisma.productUpdateLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return logs;
}

export async function deleteLogEntry(logId: number): Promise<void> {
  await prisma.productUpdateLog.delete({ where: { id: logId } });
}

export async function deleteAllLogs(): Promise<void> {
  await prisma.productUpdateLog.deleteMany();
}
