'use client';
import { User } from 'lucia-auth';
import LoginBox from './loginBox';

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6 bg-gray-900 shadow-lg">
      <a href={'/'} className="text-3xl font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-white">
          OzSkate
        </span>
      </a>

      <div>
        <LoginBox initialUser={user} />
      </div>
    </header>
  );
}
