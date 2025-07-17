import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/header/header';
import { validateRequest } from '@/lib/cookies';
import Script from 'next/script';
import Footer from '@/components/ui/footer';

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
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}')
            `,
          }}
        />
      </head>
      <body>
        <Header user={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
