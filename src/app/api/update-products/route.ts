'use server';
import { NextRequest, NextResponse } from 'next/server';
import { updateAllProducts } from '@/lib/product/update';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  // TODO: Security
  try {
    await updateAllProducts();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ status: 200 });
}
