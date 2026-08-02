'use client';

import { useState } from 'react';
import { Donation } from '@/lib/types';
import VoiceRecorder from '@/components/VoiceRecorder';
import { Heart, ShieldCheck, Zap, MessageSquare, Volume2, Video } from 'lucide-react';

export default function Home() {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState<number>(10000);
  const [message, setMessage] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'vn' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);

  const presets = [5000, 10000, 25000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 1000) {
      alert('Nominal donasi minimal Rp 1.000');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim() || 'Anonim',
          amount: Number(amount),
          message,
          mediaType,
          mediaUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveDonation(data.donation);
      } else {
        alert(data.error || 'Gagal memproses donasi');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-xl flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="p-2 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            InterActive QRIS <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">0% Fee</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <a href="/admin" className="hover:text-red-400 transition-colors">Admin Dashboard</a>
          <span>•</span>
          <a href="/overlay" target="_blank" className="hover:text-rose-400 transition-colors">OBS Overlay</a>
        </div>
      </header>

      {!activeDonation ? (
        <div className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Dukung TOPUPWITHJIJULCHANNEL
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Donasi langsung ke InterActive QRIS Merchant tanpa potongan!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Nama Pengirim / Pseudonym
              </label>
              <input
                type="text"
                placeholder="Contoh: SultanStreamer"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Nominal Donasi (Rp)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      amount === val
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                placeholder="Nominal custom..."
              />
            </div>

            {/* Media Choice */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Pilih Tipe Media Pesan
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setMediaType('text'); setMediaUrl(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 ${
                    mediaType === 'text'
                      ? 'bg-red-600/20 border-red-500 text-red-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" /> Pesan Teks
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('vn')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 ${
                    mediaType === 'vn'
                      ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Volume2 className="w-5 h-5" /> Voice Note
                </button>
                <button
                  type="button"
                  onClick={() => { setMediaType('video'); setMediaUrl(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 ${
                    mediaType === 'video'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Video className="w-5 h-5" /> Video Link
                </button>
              </div>
            </div>

            {/* Message input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Pesan untuk Streamer
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan pesanmu untuk dibaca di screen livestream..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm"
              />
            </div>

            {/* Media Components */}
            {mediaType === 'vn' && (
              <VoiceRecorder
                onAudioReady={(url) => setMediaUrl(url)}
                onClearAudio={() => setMediaUrl('')}
              />
            )}

            {mediaType === 'video' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                  URL YouTube / Video
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-slate-900/80 border border-purple-500/40 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white text-white" /> Lanjut ke QRIS Pembayaran
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* InterActive QRIS Modal Payment View */
        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 text-center border border-red-500/30 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" /> InterActive QRIS Standar Pembayaran Nasional
          </div>

          <h2 className="text-xl font-bold mb-0.5">TOPUPWITHJIJULCHANNEL</h2>
          <p className="text-[11px] text-slate-400 mb-4 font-mono">NMID: ID1025453265676</p>

          {/* Unique Nominal Box */}
          <div className="bg-slate-900/90 border border-red-500/40 rounded-2xl p-4 mb-5 shadow-inner">
            <span className="text-xs text-slate-400 block uppercase font-medium">Nominal Pas yang Harus Ditransfer:</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              Rp {activeDonation.uniqueAmount.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-amber-400 mt-2 font-medium bg-amber-500/10 py-1 px-2 rounded-lg">
              ⚠️ PENTING: Transfer SESUAI nominal tepat hingga digit terakhir agar otomatis terverifikasi!
            </p>
          </div>

          {/* InterActive QR Code Frame */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-xl mb-4 border-4 border-red-600 relative">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">InterActive QRIS</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126680016ID.CO.QRIS.WWW01189360081500000000005204581253033605802ID5922TOPUPWITHJIJULCHANNEL6007JAKARTA6105121106304C102`}
              alt="InterActive QRIS TOPUPWITHJIJULCHANNEL"
              className="w-56 h-56 rounded-lg object-contain mx-auto"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Menunggu konfirmasi notifikasi pembayaran...
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveDonation(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl transition-all"
              >
                Kembali / Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
