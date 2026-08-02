import { Donation, StreamerConfig } from './types';

// In-memory mock storage for local demo & vercel preview without external DB setup
// Supports automatic matching & realtime event simulation

let donations: Donation[] = [
  {
    id: 'don-demo-1',
    donorName: 'SultanStream',
    amount: 50000,
    uniqueAmount: 50012,
    message: 'Semangat terus bang livestream-nya! Sukses selalu 🔥',
    mediaType: 'text',
    status: 'PAID',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    paidAt: new Date(Date.now() - 3500000).toISOString(),
  }
];

let streamerConfig: StreamerConfig = {
  streamerName: 'SeaBank Streamer',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580016ID.CO.QRIS.WWW01189360091400000000005204581253033605802ID5915SEABANK_STREAM6007JAKARTA6105121106304C102',
  seaBankName: 'AZIZUL STREAMER',
  seaBankNumber: '901234567890',
  minAmountText: 5000,
  minAmountVn: 10000,
  minAmountVideo: 25000,
  secretKey: 'seabank-secret-key-123',
};

// Global queue for pending real-time events for OBS broadcast
let eventListeners: Array<(donation: Donation) => void> = [];

export function getStreamerConfig(): StreamerConfig {
  return streamerConfig;
}

export function updateStreamerConfig(newConfig: Partial<StreamerConfig>): StreamerConfig {
  streamerConfig = { ...streamerConfig, ...newConfig };
  return streamerConfig;
}

export function getDonations(): Donation[] {
  return donations;
}

export function createDonation(data: {
  donorName: string;
  amount: number;
  message: string;
  mediaType: 'text' | 'vn' | 'video';
  mediaUrl?: string;
}): Donation {
  // Generate unique 3-digit code (e.g., 10000 -> 10047)
  const randomUniqueCode = Math.floor(Math.random() * 499) + 1;
  const uniqueAmount = data.amount + randomUniqueCode;

  const newDonation: Donation = {
    id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    donorName: data.donorName || 'Anonim',
    amount: data.amount,
    uniqueAmount: uniqueAmount,
    message: data.message || '',
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  donations.unshift(newDonation);
  return newDonation;
}

export function findPendingByAmount(amount: number): Donation | undefined {
  return donations.find(
    (d) => d.status === 'PENDING' && Math.abs(d.uniqueAmount - amount) <= 2
  );
}

export function markAsPaid(id: string): Donation | null {
  const donation = donations.find((d) => d.id === id);
  if (donation) {
    donation.status = 'PAID';
    donation.paidAt = new Date().toISOString();
    notifyListeners(donation);
    return donation;
  }
  return null;
}

export function subscribeToPaidDonations(callback: (donation: Donation) => void) {
  eventListeners.push(callback);
  return () => {
    eventListeners = eventListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners(donation: Donation) {
  eventListeners.forEach((callback) => callback(donation));
}
