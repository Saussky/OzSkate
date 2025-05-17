'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from './actions';
import Button from '../button';

type LoginBoxProps = {
  initialUser: { username: string; admin: boolean } | null;
};

export default function LoginBox({ initialUser }: LoginBoxProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState<string | null>(
    initialUser?.username || ''
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // clear any previous error
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
        const errorData = await res.json();
        setError(
          errorData.error || 'Login failed. Please check your credentials.'
        );
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUsername(null);
    } catch {
      setError('Error signing out.');
    }
  };

  return (
    <div className="bg-white text-black rounded p-4 flex flex-col space-y-4">
      {username ? (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="font-medium">
            Welcome, <span className="font-bold">{username}</span>!
          </div>
          {initialUser?.admin && (
            <Button
              onClick={() => router.push('/admin')}
              variant="smart"
              size="small"
            >
              Admin
            </Button>
          )}
          <Button
            onClick={() => router.push('/account')}
            variant="primary"
            size="small"
          >
            Account
          </Button>
          <Button onClick={handleSignOut} variant="danger" size="small">
            Sign Out
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2"
        >
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full md:w-auto flex-1 border border-gray-400 bg-white placeholder-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full md:w-auto flex-1 border border-gray-400 bg-white placeholder-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Button
              type="submit"
              onClick={() => {}}
              variant="primary"
              size="small"
            >
              Log In
            </Button>

            <Button
              onClick={() => router.push('/signup')}
              variant="secondary"
              size="small"
            >
              Sign Up
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
