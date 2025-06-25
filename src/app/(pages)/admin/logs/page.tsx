// app/admin/logs/page.tsx
import AdminLogsComponent from '@/components/admin/logs/logs';
import { prisma } from '@/lib/prisma';

export default async function LogsPage() {
  const initialLogs = await prisma.productUpdateLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return <AdminLogsComponent initialLogs={initialLogs} />;
}
