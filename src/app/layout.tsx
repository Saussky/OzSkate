import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/header/header';
import { validateRequest } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'OzSkate',
  description: 'All Aussie core skateshops in one place',
};

// TODO: Pass user into the children via context as well
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
