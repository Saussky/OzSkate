'use client';
import { useState } from 'react';
import { signOut } from '@/lib/actions';

type LoginBoxProps = {
  initialUser: { username: string } | null;
};

export default function LoginBox({ initialUser }: LoginBoxProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState<string | null>(
    initialUser?.username || ''
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUsername(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      {username ? (
        <div className="flex items-center space-x-4">
          <div className="text-white font-medium">
            Welcome, <span className="font-bold">{username}</span>!
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex items-center space-x-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />

          <button
            type="submit"
            className="p-2 bg-lime-500 text-black rounded hover:bg-lime-400 transition"
          >
            Log In
          </button>
        </form>
      )}
    </div>
  );
}
