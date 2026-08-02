import { NextResponse } from 'next/server';
import { getDonations, markAsPaid } from '@/lib/store';

export async function GET() {
  const donations = getDonations();
  const paidDonations = donations.filter((d) => d.status === 'PAID');
  return NextResponse.json({ success: true, donations: paidDonations });
}

export async function POST(request: Request) {
  // Manual trigger / simulate payment for testing
  try {
    const { id } = await request.json();
    const updated = markAsPaid(id);
    return NextResponse.json({ success: true, donation: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
