'use client';
import { User } from 'lucia-auth';
import { useState } from 'react';

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  console.log('user', user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState<string | null>(user?.username || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

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
        setIsLoggedIn(true);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 shadow-lg">
      <div className="text-3xl font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-black">
          OzSkate
        </span>
      </div>

      <div>
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="flex items-center space-x-2">
            <input
              type="email"
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
        ) : (
          <div className="text-white font-medium">
            Welcome, <span className="font-bold">{username}</span>!
          </div>
        )}
      </div>
    </header>
  );
}
