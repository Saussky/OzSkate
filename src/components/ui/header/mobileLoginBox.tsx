'use client';
import React from 'react';
import { User } from 'lucia-auth';
import LoginBox from './loginBox';

interface MobileLoginBoxProps {
  initialUser: User | null;
  onClose: () => void;
}

const MobileLoginModal: React.FC<MobileLoginBoxProps> = ({
  initialUser,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
  >
    <div className="relative bg-white w-full max-w-sm mx-4 rounded-lg p-6 pt-12 pr-12">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close login"
        className="
          absolute top-3 right-3
          h-10 w-10 flex items-center justify-center
          text-2xl text-gray-700
          rounded-full hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        <span aria-hidden>×</span>
      </button>

      <LoginBox initialUser={initialUser} />
    </div>
  </div>
);

export default MobileLoginModal;
