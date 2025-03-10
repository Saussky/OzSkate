/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useTransition, useEffect } from 'react';
import Button from '../../ui/button';
import { fetchUsers, toggleUserAdminStatus } from './actions';

interface User {
  id: string;
  username: string;
  email: string;
  admin: boolean;
}

export default function ManageUsers(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [fetchError, setFetchError] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [isFetching, startFetch] = useTransition();
  const [isUpdating, startUpdate] = useTransition();

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setFetchError('Error fetching users.');
    }
  };

  useEffect(() => {
    startFetch(() => {
      loadUsers();
    });
  }, []);

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    startUpdate(async () => {
      try {
        setUpdateMessage('Updating user...');
        await toggleUserAdminStatus(userId, currentStatus);
        await loadUsers();
        setUpdateMessage('User updated successfully.');
        setTimeout(() => setUpdateMessage(''), 2000);
      } catch (error) {
        console.error('Error updating user:', error);
        setUpdateMessage('Error updating user.');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h2>
      {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="py-2">Username</th>
              <th className="py-2">Email</th>
              <th className="py-2">Admin</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200">
                <td className="py-2">{user.username}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.admin ? 'Yes' : 'No'}</td>
                <td className="py-2">
                  <Button
                    onClick={() => handleToggleAdmin(user.id, user.admin)}
                    variant="smart"
                    size="small"
                  >
                    {user.admin ? 'Revoke Admin' : 'Make Admin'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {updateMessage && (
        <p className="text-sm text-gray-600">{updateMessage}</p>
      )}
    </div>
  );
}
