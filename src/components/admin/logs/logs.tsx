'use client';
import { useState, useTransition } from 'react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { deleteLogEntry, deleteAllLogs, fetchLogs } from './actions';

interface LogEntry {
  id: number;
  createdAt: string;
  shopName: string | null;
  productTitle: string | null;
  variantTitle: string | null;
  changeType: string;
  description: string;
}

// Props passed from server (initial log entries)
interface AdminLogsProps {
  initialLogs: any[];
}

export default function AdminLogsComponent({ initialLogs }: AdminLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [isRefreshing, startRefreshing] = useTransition();
  const [isClearing, startClearing] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleRefreshLogs = () => {
    startRefreshing(async () => {
      try {
        const latestLogs = await fetchLogs();
        setLogs(latestLogs);
      } catch (error) {
        console.error('Failed to refresh logs:', error);
      }
    });
  };

  const handleDeleteLog = async (logId: number) => {
    setDeletingId(logId);
    try {
      await deleteLogEntry(logId);
      // Optimistically update UI by removing the log from state
      setLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch (error) {
      console.error('Failed to delete log entry:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearLogs = () => {
    startClearing(async () => {
      try {
        await deleteAllLogs();
        setLogs([]); // clear all logs from state
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Update Logs</h2>
        <div className="space-x-2">
          <Button
            onClick={handleRefreshLogs}
            disabled={isRefreshing}
            variant="smart"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
          </Button>
          <Button
            onClick={handleClearLogs}
            disabled={isClearing}
            variant="danger"
          >
            {isClearing ? 'Clearing...' : 'Delete All Logs'}
          </Button>
        </div>
      </div>

      <Card title="tbc">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="border-b font-medium text-gray-700">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Shop</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="px-3 py-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-1">{log.shopName || '-'}</td>
                  <td className="px-3 py-1">
                    {log.productTitle || 'Unknown Product'}
                    {log.variantTitle ? (
                      <div className="text-xs text-gray-600">
                        Variant: {log.variantTitle}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-1">{log.description}</td>
                  <td className="px-3 py-1">
                    <Button
                      onClick={() => handleDeleteLog(log.id)}
                      disabled={deletingId === log.id || isClearing}
                      variant="smart"
                    >
                      {deletingId === log.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    {isRefreshing || isClearing
                      ? 'Updating logs...'
                      : 'No log entries available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
