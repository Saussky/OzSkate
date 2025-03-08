'use client';
import { FormEvent, useState } from 'react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (res.ok) {
        setMessage('Signup successful! Logging you in...');

        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (loginRes.ok) {
          window.location.href = '/';
        } else {
          setMessage(
            'Signup succeeded, but login failed. Please log in manually.'
          );
        }
      } else {
        setMessage('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans text-gray-800">
      <form
        onSubmit={handleSubmit}
        id="signup-form"
        className="border border-gray-300 p-6 w-96 bg-gray-100 shadow-lg rounded-xl"
      >
        <h1 className="text-center text-xl mb-6 font-semibold">
          Create an Account
        </h1>

        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}

        <input
          value={email}
          placeholder="Email Address"
          className="w-full bg-white border border-gray-400 text-gray-900 p-3 mb-4 placeholder-gray-500 focus:outline-none rounded-lg"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          value={username}
          placeholder="Username"
          className="w-full bg-white border border-gray-400 text-gray-900 p-3 mb-4 placeholder-gray-500 focus:outline-none rounded-lg"
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          className="w-full bg-white border border-gray-400 text-gray-900 p-3 mb-4 placeholder-gray-500 focus:outline-none rounded-lg"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          form="signup-form"
          className="w-full bg-blue-600 text-white p-3 mt-6 hover:bg-blue-500 transition rounded-lg"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
