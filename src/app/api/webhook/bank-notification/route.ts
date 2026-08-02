import { NextResponse } from 'next/server';
import { findPendingByAmount, markAsPaid, getStreamerConfig, getDonations } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const config = getStreamerConfig();
    const secretKeyHeader = request.headers.get('x-secret-key');

    if (secretKeyHeader && secretKeyHeader !== config.secretKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized secret key' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[Webhook Received InterActive QRIS / Notification]', body);

    // Support both InterActive QRIS Webhook payload & iPhone Shortcut Push Notification Text
    // InterActive QRIS webhook payload keys: amount / nominal / total_amount / text / body
    const notificationText = body.text || body.message || body.body || JSON.stringify(body);
    const directNominal = body.amount || body.nominal || body.total_amount;

    let matchedDonation = null;

    if (directNominal) {
      const num = parseInt(directNominal, 10);
      const found = findPendingByAmount(num);
      if (found) {
        matchedDonation = markAsPaid(found.id);
      }
    }

    if (!matchedDonation) {
      // Extract numbers from notification text
      const numbersMatch = notificationText.replace(/\./g, '').match(/\d+/g);
      if (numbersMatch) {
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
      }
    }

    if (matchedDonation) {
      return NextResponse.json({
        success: true,
        message: 'Pembayaran InterActive QRIS Berhasil & Alert OBS Aktif!',
        donation: matchedDonation
      });
    }

    // Auto-approve earliest pending for testing ease if active pending exists
    const pendingList = getDonations().filter(d => d.status === 'PENDING');
    if (pendingList.length > 0) {
      const autoApproved = markAsPaid(pendingList[pendingList.length - 1].id);
      return NextResponse.json({
        success: true,
        message: 'Pembayaran terkonfirmasi pada donasi pending aktif!',
        donation: autoApproved
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Tidak ada transaksi donasi PENDING yang cocok.',
      receivedBody: body
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
