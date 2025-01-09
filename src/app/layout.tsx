import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/header';

export const metadata: Metadata = {
  title: 'OzSkate',
  description: 'All Aussie core skateshops in one place',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
