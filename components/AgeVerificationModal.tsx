'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const verified = localStorage.getItem('vapewell_age_verified') || localStorage.getItem('savage_age_verified');
      if (!verified) {
        setIsOpen(true);
      }
    } catch (e) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem('vapewell_age_verified', 'true');
    } catch (e) {}
    setIsOpen(false);
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-2xl text-center text-gray-900">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-[#2b9685] bg-[#45cab4]/15 rounded-full border border-[#45cab4]/30">
            Age Verification Required
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-gray-900 mb-2">
          Are you 18 or older?
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Under Australian law, vaping and nicotine products may only be sold to and consumed by individuals aged 18 years and older. Please verify your age to enter Vape Well Australia.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 text-xs font-bold uppercase tracking-wider text-black bg-[#45cab4] hover:bg-[#37b19d] rounded-full transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Am 18+ (Enter)</span>
          </button>

          <button
            onClick={handleReject}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Under 18 (Exit)</span>
          </button>
        </div>

        <p className="mt-5 text-[11px] text-gray-400">
          By entering this website, you confirm you are at least 18 years old and agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
