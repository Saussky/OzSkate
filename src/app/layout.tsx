import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/header';
import { validateRequest } from '@/lib/lucia';

export const metadata: Metadata = {
  title: 'OzSkate',
  description: 'All Aussie core skateshops in one place',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();

  return (
    <html lang="en">
      <body>
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
