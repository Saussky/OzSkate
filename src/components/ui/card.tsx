'use client';
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export default function Card({ title, children }: CardProps): JSX.Element {
  return (
    <div className="flex-1  p-6 bg-white rounded-lg shadow-lg">
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <div className="mt-2 text-3xl font-bold text-blue-500">{children}</div>
    </div>
  );
}
