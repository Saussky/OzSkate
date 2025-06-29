'use server';
import { NextRequest, NextResponse } from 'next/server';
import { updateAllProducts } from '@/lib/product/update';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const incomingSecret = request.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    console.log('incoming secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateAllProducts();
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('update-products failed', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
