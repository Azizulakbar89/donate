'use client';

import { useEffect, useState } from 'react';
import { Donation } from '@/lib/types';

export default function OverlayPage() {
  const [currentAlert, setCurrentAlert] = useState<Donation | null>(null);

  useEffect(() => {
    // Poll for new paid donations to show in OBS Alert
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/overlay/feed');
        const data = await res.json();
        if (data.success && data.donations.length > 0) {
          // Pick the latest paid donation if not currently playing
          const latest = data.donations[0];
          if (!currentAlert || currentAlert.id !== latest.id) {
            setCurrentAlert(latest);
            // Hide alert after 8 seconds duration
            setTimeout(() => {
              setCurrentAlert(null);
            }, 8000);
          }
        }
      } catch (err) {
        console.error('Overlay feed poll error', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentAlert]);

  if (!currentAlert) {
    return <div className="w-screen h-screen bg-transparent" />;
  }

  return (
    <main className="w-screen h-screen bg-transparent flex items-center justify-center p-8 overflow-hidden select-none">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.5)] max-w-lg w-full text-center animate-in zoom-in-75 slide-in-from-bottom-12 duration-500 relative">
        {/* Glowing badge header */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-pink-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          NEW DONATION!
        </div>

        {/* Donor Name & Amount */}
        <div className="mt-2">
          <h2 className="text-2xl font-black text-white tracking-wide">
            {currentAlert.donorName}
          </h2>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono mt-1">
            Rp {currentAlert.amount.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Message */}
        {currentAlert.message && (
          <div className="mt-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-slate-200 text-sm italic font-medium leading-relaxed">
            "{currentAlert.message}"
          </div>
        )}

        {/* Media Preview: Voice Note */}
        {currentAlert.mediaType === 'vn' && currentAlert.mediaUrl && (
          <div className="mt-4 p-3 bg-pink-950/40 border border-pink-500/40 rounded-2xl flex flex-col items-center gap-2">
            <span className="text-xs text-pink-400 font-semibold uppercase tracking-wider">
              🎙️ Voice Note Diputar
            </span>
            <audio src={currentAlert.mediaUrl} autoPlay controls className="h-9 w-full max-w-xs" />
          </div>
        )}

        {/* Media Preview: Video Link */}
        {currentAlert.mediaType === 'video' && currentAlert.mediaUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-purple-500/40">
            <iframe
              src={currentAlert.mediaUrl.replace('watch?v=', 'embed/')}
              className="w-full h-48 rounded-xl"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}
      </div>
    </main>
  );
}
