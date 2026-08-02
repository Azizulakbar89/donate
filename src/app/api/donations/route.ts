import { NextResponse } from 'next/server';
import { getDonations, createDonation } from '@/lib/store';

export async function GET() {
  const donations = getDonations();
  return NextResponse.json({ success: true, donations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorName, amount, message, mediaType, mediaUrl } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { success: false, error: 'Nominal donasi minimal Rp 1.000' },
        { status: 400 }
      );
    }

    const donation = createDonation({
      donorName: donorName || 'Anonim',
      amount: Number(amount),
      message: message || '',
      mediaType: mediaType || 'text',
      mediaUrl,
    });

    return NextResponse.json({ success: true, donation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
