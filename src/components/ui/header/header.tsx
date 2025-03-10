'use client';
import { User } from 'lucia-auth';
import LoginBox from './loginBox';
import Link from 'next/link';

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  return (
    <header
      className="
        flex justify-between items-center
        border border-gray-400 px-6 shadow-sm
      "
    >
      <Link href="/" className="text-4xl font-bold tracking-wide">
        <span className="border-color-black outline-4 text-red-600">
          OzSkate
        </span>
      </Link>

      <LoginBox initialUser={user} />
    </header>
  );
}
