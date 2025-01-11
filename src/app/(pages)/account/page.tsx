'use client';

import { changePassword } from '@/lib/actions';
import { useState, useTransition } from 'react';

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

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
    <div className="p-8 max-w-md mx-auto bg-gray-800 text-white rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          className={`w-full p-2 rounded text-black transition ${
            isPending
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-lime-500 hover:bg-lime-400'
          }`}
          disabled={isPending}
        >
          {isPending ? 'Updating...' : 'Change Password'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
