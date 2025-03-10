'use client';
import Link from 'next/link';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <nav className="flex justify-center space-x-4">
          <Link
            href="/admin/shops"
            className="
              px-4 py-2 border border-gray-400 bg-white text-black 
              rounded hover:bg-gray-50 transition
            "
          >
            Shops
          </Link>

          <Link
            href="/admin/duplicates/products"
            className="
              px-4 py-2 border border-gray-400 bg-white text-black 
              rounded hover:bg-gray-50 transition
            "
          >
            Duplicate Products
          </Link>

          <Link
            href="/admin/duplicates/brands"
            className="
              px-4 py-2 border border-gray-400 bg-white text-black 
              rounded hover:bg-gray-50 transition
            "
          >
            Duplicate Brands
          </Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
