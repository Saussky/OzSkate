'use server';
import Signup from '@/components/auth/signup/signup';
import { validateRequest } from '@/lib/cookies';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const { user } = await validateRequest();

  if (user) {
    redirect('/');
  }

  return <Signup />;
}
