'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from './actions';
import Button from '../button';

type LoginBoxProps = {
  initialUser: { username: string } | null;
};

export default function LoginBox({ initialUser }: LoginBoxProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState<string | null>(
    initialUser?.username || ''
  );
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const goToAccount = () => {
    router.push('/account');
  };

  const goToSignup = () => {
    router.push('/signup');
  };

  return (
    <div
      className="
        bg-white text-black rounded 
        p-4 flex flex-col space-y-4
      "
    >
      {username ? (
        <div className="flex items-center space-x-4">
          <div className="font-medium">
            Welcome, <span className="font-bold">{username}</span>!
          </div>
          <Button onClick={goToAccount} variant="primary" size="small">
            Account
          </Button>
          <Button onClick={handleSignOut} variant="danger" size="small">
            Sign Out
          </Button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="
              border border-gray-400 bg-white text-black placeholder-gray-400
              rounded px-2 py-1 text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500
            "
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="
              border border-gray-400 bg-white text-black placeholder-gray-400
              rounded px-2 py-1 text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500
            "
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              onClick={() => {}}
              variant="primary"
              size="small"
            >
              Log In
            </Button>
            <Button onClick={goToSignup} variant="secondary" size="small">
              Sign Up
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
