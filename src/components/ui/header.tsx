'use client';

import { useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        console.log('data', data);
        setUsername(data.username);
        setIsLoggedIn(true);
      } else {
        console.error('Failed to log in');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 shadow-lg">
      <div className="text-3xl font-bold">
        <span
          style={{
            color: 'black',
            background: 'linear-gradient(to right, red, yellow)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          OzSkate
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="flex items-center space-x-2">
            <input
              value={email}
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white focus:outline-none"
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
