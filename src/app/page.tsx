'use server';
import './globals.css';
import Storefront from '@/components/storefront/storefront';
import { validateRequest } from '@/lib/lucia';

export default async function Home() {
  const { user } = await validateRequest();

  return <Storefront user={user} />;
}
