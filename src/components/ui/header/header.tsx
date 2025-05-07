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
    <header className="flex justify-between items-center border border-gray-400 px-6 shadow-sm">
      <Link href="/" className="flex items-center">
        <Image
          src="/ozskate_lolgo.png"
          alt="OzSkate Logo"
          width={150}
          height={40}
          priority
        />
      </Link>

      <LoginBox initialUser={user} />
    </header>
  );
}
