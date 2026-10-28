import React, { useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Home, PlusCircle, BookmarkCheck, Inbox, BarChart2, 
  Users, ArrowRightLeft, Smartphone, Settings, LogOut, 
  X, CheckCircle2, ChevronRight, Sparkles, PhoneCall
} from 'lucide-react';
import { googleSignIn, logout } from '../services/auth';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeTab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics';
  setActiveTab: (tab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics') => void;
  myListingsCount: number;
  inquiriesCount: number;
  onOpenProfile: () => void;
  onOpenMultiAccount: () => void;
  onOpenContacts: () => void;
  onOpenApkGuide: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  setActiveTab,
  myListingsCount,
  inquiriesCount,
  onOpenProfile,
  onOpenMultiAccount,
  onOpenContacts,
  onOpenApkGuide
}) => {
  // Prevent body scrolling when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle tab click and close
  const handleTabSelect = (tab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics') => {
    setActiveTab(tab);
    onClose();
  };

  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await googleSignIn();
      onClose();
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        console.warn('Sign-in note:', error?.message || error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.warn('Sign-out note:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
      {/* Backdrop */}
      <div 
        id="mobile-sidebar-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Container (Side Bar / ৬০ বার) */}
      <aside 
        id="mobile-sidebar-drawer"
        role="dialog"
        aria-label="মোবাইল সাইডবার মেনু"
        className="fixed inset-y-0 right-0 max-w-[85vw] w-80 bg-white shadow-2xl flex flex-col z-50 border-l border-slate-200 transform transition-transform duration-300 ease-in-out"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-emerald-200 bg-white p-0.5">
              <img 
                src="/logo.jpg" 
                alt="বাসা বাড়ি ভাড়া" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-sm">মেনু ও সেটিংস</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">৬০ বার</span>
              </div>
              <p className="text-[11px] text-slate-500">বাসা বাড়ি ভাড়া অ্যাপ</p>
            </div>
          </div>

          <button
            id="btn-close-mobile-sidebar"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            aria-label="সাইডবার বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content inside Drawer */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          
          {/* User Account / Auth Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-sm border border-slate-700/50">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="w-11 h-11 rounded-xl ring-2 ring-emerald-400 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base shrink-0">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate flex items-center space-x-1">
                      <span>{currentUser.displayName || 'ব্যবহারকারী'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </p>
                    <p className="text-xs text-slate-300 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <button
                    id="sidebar-btn-profile"
                    onClick={() => {
                      onOpenProfile();
                      onClose();
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="font-semibold">প্রোফাইল</span>
                  </button>

                  <button
                    id="sidebar-btn-switch-account"
                    onClick={() => {
                      onOpenMultiAccount();
                      onClose();
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="font-semibold">সুইচ অ্যাকাউন্ট</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2.5">
                <p className="text-xs text-slate-300">বিজ্ঞাপন দিতে বা বাড়িওয়ালাদের সাথে যোগাযোগ করতে গুগল দিয়ে লগইন করুন</p>
                <button
                  id="sidebar-btn-google-login"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs shadow-xs transition-colors active:scale-98"
                >
                  <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isSigningIn ? 'লগইন হচ্ছে...' : 'Google দিয়ে সাইন ইন'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenMultiAccount();
                    onClose();
                  }}
                  className="w-full text-center text-[11px] text-emerald-300 hover:text-white pt-0.5 transition-colors underline underline-offset-2"
                >
                  অন্যান্য গুগল একাউন্ট যোগ বা সুইচ করুন
                </button>
              </div>
            )}
          </div>

          {/* Primary Navigation Section */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
              প্রধান মেনু (Navigation)
            </div>

            {/* 1. Browse */}
            <button
              id="sidebar-nav-browse"
              onClick={() => handleTabSelect('browse')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                activeTab === 'browse'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${activeTab === 'browse' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">বাসা খুঁজুন</div>
                  <div className="text-[11px] text-slate-400">সকল ভাড়ার তালিকা ও সার্চ</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'browse' ? 'text-emerald-600' : 'text-slate-300'}`} />
            </button>

            {/* 2. Post Listing */}
            <button
              id="sidebar-nav-post"
              onClick={() => handleTabSelect('post')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                activeTab === 'post'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 font-semibold border border-emerald-200/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${activeTab === 'post' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">নতুন বিজ্ঞাপন দিন</div>
                  <div className={`text-[11px] ${activeTab === 'post' ? 'text-emerald-100' : 'text-emerald-600'}`}>ছবি ও লোকেশনসহ বাসা পোস্ট করুন</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'post' ? 'text-white' : 'text-emerald-600'}`} />
            </button>

            {/* 3. My Listings */}
            <button
              id="sidebar-nav-my-listings"
              onClick={() => handleTabSelect('my-listings')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                activeTab === 'my-listings'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${activeTab === 'my-listings' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">আমার বিজ্ঞাপন</div>
                  <div className="text-[11px] text-slate-400">আপনার পোস্ট করা বাসা তালিকা</div>
                </div>
              </div>
              {myListingsCount > 0 ? (
                <span className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  {myListingsCount}
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* 4. Inquiries */}
            <button
              id="sidebar-nav-inquiries"
              onClick={() => handleTabSelect('inquiries')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${activeTab === 'inquiries' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">আবেদনপত্র (Inquiries)</div>
                  <div className="text-[11px] text-slate-400">ভাড়াটিয়াদের পাঠানো বুকিং মেসেজ</div>
                </div>
              </div>
              {inquiriesCount > 0 ? (
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  {inquiriesCount}
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* 5. Analytics */}
            <button
              id="sidebar-nav-analytics"
              onClick={() => handleTabSelect('analytics')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${activeTab === 'analytics' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">ভিউ অ্যানালিটিক্স</div>
                  <div className="text-[11px] text-slate-400">কতজন বিজ্ঞাপন দেখেছেন ও পরিসংখ্যান</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-emerald-600' : 'text-slate-300'}`} />
            </button>
          </div>

          {/* Quick Utility Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
              জরুরি ফিচার ও সুবিধাসমূহ
            </div>

            {/* Google Contacts */}
            <button
              id="sidebar-tool-contacts"
              onClick={() => {
                onOpenContacts();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Google Contacts</div>
                  <div className="text-[11px] text-slate-400">ভাড়াটিয়াদের নম্বর সেভ ও সার্চ</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>

            {/* Multi Account Switcher */}
            <button
              id="sidebar-tool-multi-account"
              onClick={() => {
                onOpenMultiAccount();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">মাল্টি অ্যাকাউন্ট সুইচ</div>
                  <div className="text-[11px] text-slate-400">একাধিক গুগল একাউন্ট ম্যানেজ</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>

            {/* Android APK Release Guide */}
            <button
              id="sidebar-tool-apk"
              onClick={() => {
                onOpenApkGuide();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Android APK ডাউনলোড</div>
                  <div className="text-[11px] text-slate-400">মোবাইলে সরাসরি ইনস্টল নির্দেশিকা</div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">APK</span>
            </button>
          </div>

          {/* Logout if authenticated */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-100">
              <button
                id="sidebar-btn-logout"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 p-3 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold text-xs transition-colors border border-rose-100"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট করুন</span>
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          বাসা বাড়ি ভাড়া • মোবাইল এডিশন v1.0
        </div>
      </aside>
    </div>
  );
};
