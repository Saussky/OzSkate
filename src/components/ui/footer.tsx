'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex justify-between items-center border border-gray-400 px-6 shadow-sm h-[48px] text-sm text-gray-600">
      <span>
        Contact:{' '}
        <a href="mailto:patrick@ozskate.com.au" className="underline">
          patrick@ozskate.com.au
        </a>
      </span>
      <Link
        href="https://www.instagram.com/ozskate.com.au"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Instagram
      </Link>
    </footer>
  );
}
