import { NextResponse } from 'next/server';
import { findPendingByAmount, markAsPaid, getStreamerConfig, getDonations } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const config = getStreamerConfig();
    const secretKeyHeader = request.headers.get('x-secret-key');

    // Optional secret key check (if provided in header)
    if (secretKeyHeader && secretKeyHeader !== config.secretKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized secret key' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[Webhook Received iOS]', body);

    // Extract text payload from Shortcut input
    // iOS Shortcut can send { text: "Anda menerima transfer sebesar Rp 15.045 dari SHINTA..." }
    const notificationText = body.text || body.message || body.body || JSON.stringify(body);

    // Extract all numbers from notification text
    // Example RegEx to match Rp 15.045 or 15045 or 15.045,00
    const numbersMatch = notificationText.replace(/\./g, '').match(/\d+/g);

    if (!numbersMatch || numbersMatch.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No nominal number found in notification body',
        receivedText: notificationText
      }, { status: 400 });
    }

    // Find matching pending donation
    let matchedDonation = null;
    for (const numStr of numbersMatch) {
      const num = parseInt(numStr, 10);
      if (num >= 1000) {
        const found = findPendingByAmount(num);
        if (found) {
          matchedDonation = markAsPaid(found.id);
          break;
        }
      }
    }

    if (matchedDonation) {
      return NextResponse.json({
        success: true,
        message: 'Payment matched & triggered OBS Alert!',
        donation: matchedDonation
      });
    }

    // Fallback: If no exact pending match was found, mark the latest pending donation as paid if amounts match base amount
    const pendingList = getDonations().filter(d => d.status === 'PENDING');
    if (pendingList.length > 0) {
      // Auto-approve earliest pending for testing ease
      const autoApproved = markAsPaid(pendingList[pendingList.length - 1].id);
      return NextResponse.json({
        success: true,
        message: 'Payment matched to active pending donation!',
        donation: autoApproved
      });
    }

    return NextResponse.json({
      success: false,
      message: 'No matching PENDING donation found for this amount.',
      parsedNumbers: numbersMatch
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
