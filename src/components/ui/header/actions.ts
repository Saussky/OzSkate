/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { auth, validateRequest } from "@/lib/lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function signOut(): Promise<void> {
  try {
    const { session } = await validateRequest();

    if (session) {
      await auth.invalidateSession(session.id)
    }
  } catch (error) {
    console.error('Error signing out', error);
    throw error
  } finally {
    const sessionCookie = auth.createBlankSessionCookie();
    (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    revalidatePath('/')
  }
}