'use server';
import { validateRequest } from '@/lib/cookies';
import './globals.css';
import Storefront from '@/components/storefront/storefront';

export default async function Home() {
  const { user } = await validateRequest();

  return <Storefront user={user} />;
}
