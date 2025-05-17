'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucia-auth';
import LoginBox from './loginBox';
import MobileLoginBox from './mobileLoginBox';
import { useState } from 'react';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);

  return (
    <header className="overflow-hidden flex justify-between items-center border border-gray-400 px-6 shadow-sm h-[64px]">
      <Link href="/" className="relative h-full w-[150px] overflow-hidden">
        <Image
          src="/ozskate_logo.png"
          alt="OzSkate Logo"
          fill
          priority
          className="object-cover object-center mt-0.5"
        />
      </Link>
      <div className="hidden md:block">
        <LoginBox initialUser={user} />
      </div>
      <button
        type="button"
        className="block md:hidden text-black bg-white border border-gray-400 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        onClick={() => setMobileLoginOpen(true)}
      >
        Log In
      </button>
      {mobileLoginOpen && (
        <MobileLoginBox
          initialUser={user}
          onClose={() => setMobileLoginOpen(false)}
        />
      )}{' '}
    </header>
  );
}
