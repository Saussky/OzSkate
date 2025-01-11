'use client';
import { User } from 'lucia-auth';
import LoginBox from '../loginBox';

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 shadow-lg">
      <div className="text-3xl font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-black">
          OzSkate
        </span>
      </div>

      <div>
        <LoginBox
          initialUser={user}
          onLoginSuccess={(username) => console.log(`Logged in as ${username}`)}
        />
      </div>
    </header>
  );
}
