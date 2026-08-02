export interface Donation {
  id: string;
  donorName: string;
  amount: number; // Base amount
  uniqueAmount: number; // Final amount with decimal/unique code (e.g. 10042)
  message: string;
  mediaType: 'text' | 'vn' | 'video';
  mediaUrl?: string; // Audio URL / YouTube URL
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
  paidAt?: string;
}

export interface StreamerConfig {
  streamerName: string;
  qrisImageUrl: string;
  seaBankName: string;
  seaBankNumber: string;
  minAmountText: number;
  minAmountVn: number;
  minAmountVideo: number;
  secretKey: string;
}
