'use client';
import { changePassword } from '@/lib/actions';
import { useState, useTransition } from 'react';

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChangePassword = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        await changePassword(currentPassword, newPassword);
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      } catch (error) {
        setMessage((error as Error).message || 'An error occurred.');
      }
    });
  };

  return (
    <div className="w-2/3 h-full p-8">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Current Password
          </label>

          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-200"
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-200"
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          className={`w-48 py-2 px-4 text-white font-medium rounded ${
            isPending
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isPending}
        >
          {isPending ? 'Updating...' : 'Change Password'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-900">{message}</p>}
    </div>
  );
}
