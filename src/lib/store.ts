import { Donation, StreamerConfig } from './types';

let donations: Donation[] = [
  {
    id: 'don-demo-1',
    donorName: 'SultanStream',
    amount: 50000,
    uniqueAmount: 50012,
    message: 'Semangat livestream-nya bang! Sukses selalu 🔥',
    mediaType: 'text',
    status: 'PAID',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    paidAt: new Date(Date.now() - 3500000).toISOString(),
  }
];

let streamerConfig: StreamerConfig = {
  streamerName: 'TOPUPWITHJIJULCHANNEL',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126680016ID.CO.QRIS.WWW01189360081500000000005204581253033605802ID5922TOPUPWITHJIJULCHANNEL6007JAKARTA6105121106304C102',
  qrisMerchantName: 'TOPUPWITHJIJULCHANNEL',
  qrisNmid: 'ID1025453265676',
  minAmountText: 5000,
  minAmountVn: 10000,
  minAmountVideo: 25000,
  secretKey: 'qris-interactive-secret-123',
};

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
