import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share, ExternalLink } from 'lucide-react';

interface MobileInstallBannerProps {
  onOpenApkGuide: () => void;
}

export const MobileInstallBanner: React.FC<MobileInstallBannerProps> = ({ onOpenApkGuide }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismissed_mobile_banner');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismissed_mobile_banner', 'true');
  };

  // If already running in standalone mode (already installed app) or dismissed, do not show
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      <div 
        id="mobile-install-banner"
        className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-3 sm:px-4 py-2.5 shadow-md border-b border-emerald-700/50 relative z-30"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: App icon and title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <img 
              src="/logo.jpg" 
              alt="বাসা ভাড়া লোগো" 
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-400/50 shrink-0" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.svg'; }}
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs sm:text-sm text-white truncate">বাসা বাড়ি ভাড়া মোবাইল অ্যাপ</span>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-emerald-400/30">
                  অ্যান্ড্রয়েড ও PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                ফোনে ১-ক্লিকে ইনস্টল করুন অথবা গিটহাব থেকে সরাসরি APK ডাউনলোড করুন
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Direct PWA Install Button (Android Chrome & Desktop) */}
            {isInstallable && (
              <button
                id="btn-pwa-install"
                onClick={install}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>অ্যাপ ইনস্টল</span>
              </button>
            )}

            {/* iOS Safari Guidance button */}
            {isIOS && (
              <button
                id="btn-ios-install"
                onClick={() => setShowIOSModal(true)}
                className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
              >
                <Share className="w-3.5 h-3.5" />
                <span>iOS এ যোগ</span>
              </button>
            )}

            {/* GitHub Android APK Release Guide Button */}
            <button
              id="btn-apk-guide"
              onClick={onOpenApkGuide}
              className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-all border border-white/20"
              title="GitHub থেকে Android APK রিলিজ ও ডাউনলোড গাইড"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden xs:inline">Android APK</span>
            </button>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label="ব্যানার বন্ধ করুন"
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>iPhone / iPad এ অ্যাপ হিসেবে সেভ করুন</span>
              </h3>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed mb-4">
              <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">১</span>
                <span>Safari ব্রাউজারের নিচের টুলবারের <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।</span>
              </div>
              <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">২</span>
                <span>নিচের দিকে স্ক্রোল করে <strong>"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</strong> অপশনে ট্যাপ করুন।</span>
              </div>
              <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">৩</span>
                <span>উপরে ডানপাশে <strong>Add (যোগ)</strong> বাটনে ক্লিক করলেই মোবাইল স্ক্রিনে আমাদের লোগোসহ অ্যাপ যুক্ত হয়ে যাবে!</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
