'use client';
import { FormEvent, useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        console.log('Login successful!');
      } else {
        console.log('res', res);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono text-lime-500">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="border-2 border-lime-500 p-6 w-80 bg-gray-900 shadow-lg"
      >
        <h1 className="text-center text-lg mb-4">Log In</h1>

        <input
          name="email"
          value={email}
          placeholder="Email"
          className="w-full bg-black border border-lime-500 text-lime-500 p-2 mb-4 placeholder-gray-400 focus:outline-none"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          name="password"
          type="password"
          value={password}
          placeholder="Password"
          className="w-full bg-black border border-lime-500 text-lime-500 p-2 mb-4 placeholder-gray-400 focus:outline-none"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-lime-500 text-black p-2 mt-4 hover:bg-lime-400 transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
