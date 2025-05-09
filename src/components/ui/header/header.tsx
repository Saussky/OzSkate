'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucia-auth';
import LoginBox from './loginBox';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex justify-between items-center border border-gray-400 px-6 shadow-sm h-[64px]">
      <Link href="/" className="relative h-full w-[150px] overflow-hidden">
        <Image
          src="/ozskate_logo.png"
          alt="OzSkate Logo"
          fill
          priority
          className="object-cover object-center mt-0.5"
        />
      </Link>
      <LoginBox initialUser={user} />
    </header>
  );
}
