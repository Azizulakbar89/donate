'use client';

import { useState, useEffect } from 'react';
import { Donation } from '@/lib/types';
import { Smartphone, Copy, Check, RefreshCw, Send, Play } from 'lucide-react';

export default function AdminDashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [copied, setCopied] = useState(false);
  const [simulateAmount, setSimulateAmount] = useState('10047');

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.success) {
        setDonations(data.donations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch('/api/webhook/bank-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': 'seabank-secret-key-123',
        },
        body: JSON.stringify({
          text: `SeaBank: Anda menerima transfer sebesar Rp ${simulateAmount} dari PENGIRIM DUMMY.`,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Webhook simulasi terkirim!');
      fetchDonations();
    } catch (err) {
      alert('Gagal mengirimkan simulasi webhook');
    }
  };

  const handleManualApprove = async (id: string) => {
    try {
      await fetch('/api/overlay/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchDonations();
    } catch (err) {
      console.error(err);
    }
  };

  const copyShortcutJson = () => {
    const text = `{
  "text": "Shortcut Input / Notification Content"
}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            Admin Streamer &amp; Config iOS Shortcut
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Kelola donasi &amp; panduan integrasi notifikasi SeaBank iPhone ke Vercel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/overlay"
            target="_blank"
            className="bg-pink-600/20 border border-pink-500/40 text-pink-300 hover:bg-pink-600/30 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-pink-300" /> Buka OBS Overlay Source
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: iOS Shortcut Setup Guide */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/30">
            <h2 className="text-base font-bold flex items-center gap-2 text-blue-400 mb-4">
              <Smartphone className="w-5 h-5 text-blue-400" /> Panduan iPhone (iOS) Shortcut
            </h2>

            <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
              <li>Buka aplikasi <strong>Shortcuts</strong> di iPhone &rarr; Pilih <strong>Automation</strong>.</li>
              <li>Buat Otomatisasi Baru &rarr; Pilih pemicu <strong>Notification</strong> (Aplikasi: <strong>SeaBank</strong>).</li>
              <li>Pilih <strong>Run Immediately</strong> (Jalankan Segera).</li>
              <li>Tambahkan aksi <strong>Get Contents of URL</strong>:
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800 my-1 break-all select-all">
                  POST https://[VERCEL_URL]/api/webhook/bank-notification
                </div>
              </li>
              <li>Set Request Body ke <code>JSON</code> dan kirim teks notifikasi.</li>
            </ol>

            <button
              onClick={copyShortcutJson}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Berhasil Di-copy!' : 'Copy Contoh JSON Payload'}
            </button>
          </div>

          {/* Test Webhook Simulator */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold mb-2 text-slate-200">Uji Webhook Notifikasi (Simulasi)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulasikan notifikasi masuk dari SeaBank untuk ngetes alert OBS
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">Nominal Transfer (Rp):</label>
                <input
                  type="text"
                  value={simulateAmount}
                  onChange={(e) => setSimulateAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono mt-1"
                />
              </div>

              <button
                onClick={handleSimulateWebhook}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Send className="w-4 h-4" /> Kirim Webhook Notifikasi Test
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Donation List History */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">Riwayat &amp; Status Donasi</h2>
              <p className="text-xs text-slate-400">Total {donations.length} donasi tercatat</p>
            </div>
            <button
              onClick={fetchDonations}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {donations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">Belum ada donasi masuk</div>
            ) : (
              donations.map((don) => (
                <div
                  key={don.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{don.donorName}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          don.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {don.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                      Rp {don.uniqueAmount.toLocaleString('id-ID')}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Base: Rp {don.amount.toLocaleString('id-ID')})
                      </span>
                    </div>

                    {don.message && (
                      <p className="text-xs text-slate-400 italic mt-1 font-sans">"{don.message}"</p>
                    )}
                  </div>

                  {don.status === 'PENDING' && (
                    <button
                      onClick={() => handleManualApprove(don.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                    >
                      Approve Manual
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
