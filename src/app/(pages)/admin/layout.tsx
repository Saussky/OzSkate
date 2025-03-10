'use client';
import Link from 'next/link';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const linkStyle =
    'px-4 py-2 border border-gray-400 bg-white text-black rounded hover:bg-gray-50 transition';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <nav className="flex justify-center space-x-4">
          <Link href="/admin/shops" className={`${linkStyle}`}>
            Shops
          </Link>

          <Link href="/admin/duplicates/products" className={`${linkStyle}`}>
            Duplicate Products
          </Link>

          <Link href="/admin/duplicates/brands" className={`${linkStyle}`}>
            Duplicate Brands
          </Link>

          <Link href="/admin/users" className={`${linkStyle}`}>
            Users
          </Link>

          <Link href="/" className={`${linkStyle}`}>
            Storefront
          </Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
