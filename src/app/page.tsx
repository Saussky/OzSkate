'use server';
import './globals.css';
import StoreFront from '@/app/(pages)/storefront/storeFront';
import { validateRequest } from '@/lib/lucia';

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
      <StoreFront user={user} />
    </div>
  );
}
