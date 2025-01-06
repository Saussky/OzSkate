'use server';
import StoreFront from '@/components/storeFront';
import './globals.css';

export default async function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
      <StoreFront />
    </div>
  );
}
