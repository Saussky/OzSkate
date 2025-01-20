'use server';
import StoreFront from '@/components/storeFront';
import './globals.css';
import { validateRequest } from '@/lib/lucia';

//TODO: fix type error
export default async function Home() {
  const { user } = await validateRequest();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
      <StoreFront user={user} />
    </div>
  );
}
