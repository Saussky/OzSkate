'use client';
import { FormEvent, useState } from 'react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (res.ok) {
        console.log('Signup successful!');
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
        id="signup-form"
        className="border-2 border-lime-500 p-6 w-80 bg-gray-900 shadow-lg"
      >
        <h1 className="text-center text-lg mb-4">Sign Up</h1>

        <input
          value={email}
          placeholder="Enter Email"
          className="w-full bg-black border border-lime-500 text-lime-500 p-2 mb-4 placeholder-gray-400 focus:outline-none"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          value={username}
          placeholder="Enter Username"
          className="w-full bg-black border border-lime-500 text-lime-500 p-2 mb-4 placeholder-gray-400 focus:outline-none"
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          value={password}
          placeholder="Enter Password"
          className="w-full bg-black border border-lime-500 text-lime-500 p-2 mb-4 placeholder-gray-400 focus:outline-none"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          form="signup-form"
          className="w-full bg-lime-500 text-black p-2 mt-4 hover:bg-lime-400 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
