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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative bg-white w-full max-w-sm mx-4 rounded-lg p-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close login"
        className="
          absolute top-4 right-4 p-2
          text-2xl text-gray-700
          rounded-full
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        ×
      </button>
      <LoginBox initialUser={initialUser} />
    </div>
  </div>
);

export default MobileLoginModal;
