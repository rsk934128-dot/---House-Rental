import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, logout } from '../services/auth';
import { 
  Home, PlusCircle, BookmarkCheck, LogOut, CheckCircle2, 
  BarChart2, ArrowRightLeft, Users, Smartphone, Menu 
} from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics';
  setActiveTab: (tab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics') => void;
  myListingsCount: number;
  inquiriesCount: number;
  onOpenSignInModal?: () => void;
  onOpenProfile?: () => void;
  onOpenMultiAccount?: () => void;
  onOpenContacts?: () => void;
  onOpenApkGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await googleSignIn();
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
    } catch (error) {
      console.warn('Sign-out note:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Brand Name */}
            <div 
              id="brand-logo"
              onClick={() => setActiveTab('browse')}
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0 shrink"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform bg-white border border-emerald-100 flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src="/logo.jpg" 
                  alt="বাসা বাড়ি ভাড়া লোগো" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
              </div>
              <div className="min-w-0 truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base sm:text-xl text-slate-900 tracking-tight truncate">বাসা বাড়ি ভাড়া</span>
                  <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-full shrink-0">বাংলা</span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block truncate">বাড়িওয়ালা ও ভাড়াটিয়াদের সহজ সমাধান</p>
              </div>
            </div>

            {/* Desktop Center Navigation Tabs (Hidden on mobile to eliminate overflow) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                id="nav-tab-browse"
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'browse'
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>বাসা খুঁজুন</span>
              </button>

              <button
                id="nav-tab-post"
                onClick={() => setActiveTab('post')}
                className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'post'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>ভাড়া বিজ্ঞাপন দিন</span>
              </button>

              <button
                id="nav-tab-my-listings"
                onClick={() => setActiveTab('my-listings')}
                className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all relative flex items-center space-x-1.5 ${
                  activeTab === 'my-listings'
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>আমার বিজ্ঞাপন</span>
                {myListingsCount > 0 && (
                  <span className="bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">
                    {myListingsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-inquiries"
                onClick={() => setActiveTab('inquiries')}
                className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all relative flex items-center space-x-1.5 ${
                  activeTab === 'inquiries'
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs sm:text-sm">আবেদনপত্র</span>
                {inquiriesCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">
                    {inquiriesCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>অ্যানালিটিক্স</span>
              </button>
            </nav>

            {/* Right Controls: Desktop actions & Mobile ৬০ বার (Sidebar) button */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Authenticated User Desktop controls */}
              {currentUser ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    id="btn-open-profile"
                    onClick={onOpenProfile}
                    title="প্রোফাইল ও একাউন্ট কন্ট্রোল দেখুন"
                    className="flex items-center space-x-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-emerald-50 transition-colors text-left group shrink-0"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'ব্যবহারকারী'}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-emerald-500 object-cover group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm group-hover:scale-105 transition-transform shrink-0">
                        {currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="hidden xl:block text-left text-xs">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1 group-hover:text-emerald-700">
                        <span>{currentUser.displayName?.split(' ')[0]}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[100px]">প্রোফাইল</div>
                    </div>
                  </button>

                  {/* Google Contacts Button (Desktop & Tablet) */}
                  <button
                    id="btn-navbar-contacts"
                    onClick={onOpenContacts}
                    title="Google Contacts - ভাড়াটিয়া ও বাড়িওয়ালাদের ফোন নম্বর"
                    className="hidden lg:flex p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all items-center space-x-1.5 border border-slate-200/80 hover:border-emerald-200 shadow-2xs"
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="hidden xl:inline text-xs font-semibold text-slate-700">কন্টাক্টস</span>
                  </button>

                  {/* Multi-Account Switch Button (Desktop & Tablet) */}
                  <button
                    id="btn-navbar-multi-account"
                    onClick={onOpenMultiAccount}
                    title="মাল্টি অ্যাকাউন্ট সুইচ করুন"
                    className="hidden lg:flex p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all items-center space-x-1 border border-slate-200/80 hover:border-emerald-200 shadow-2xs"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                    <span className="hidden xl:inline text-xs font-semibold text-slate-700">সুইচ অ্যাকাউন্ট</span>
                  </button>

                  {/* Mobile APK Release Guide (Desktop & Tablet) */}
                  <button
                    id="btn-navbar-apk-guide"
                    onClick={onOpenApkGuide}
                    title="Android APK রিলিজ ও মোবাইল ইনস্টল নির্দেশিকা"
                    className="hidden sm:flex p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all items-center space-x-1 border border-slate-200/80 hover:border-emerald-200 shadow-2xs"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="hidden xl:inline text-xs font-semibold text-slate-700">APK</span>
                  </button>

                  <button
                    id="btn-logout"
                    onClick={handleSignOut}
                    title="লগআউট করুন"
                    className="hidden md:flex p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Unauthenticated Google Sign-In */
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <button
                    id="btn-google-signin"
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="gsi-material-button inline-flex items-center px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 border border-slate-300 shadow-2xs rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <div className="gsi-material-button-content-wrapper flex items-center space-x-1.5">
                      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                        <svg viewBox="0 0 48 48" className="w-full h-full">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents font-medium text-slate-700">
                        {isSigningIn ? '...' : 'লগইন'}
                      </span>
                    </div>
                  </button>

                  <button
                    id="btn-open-apk-logged-out"
                    onClick={onOpenApkGuide}
                    title="Android APK রিলিজ ও মোবাইল অ্যাপ"
                    className="hidden sm:flex p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-300 bg-white transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              )}

              {/* Mobile Sidebar Button (৬০ বার বাটন) - Accessible & Perfectly Fitted for Mobile Screens */}
              <button
                id="btn-mobile-sidebar-toggle"
                onClick={() => setIsSidebarOpen(true)}
                title="৬০ বার - মোবাইল সাইডবার মেনু খুলুন"
                aria-label="৬০ বার মেনু"
                className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 text-emerald-800 hover:from-emerald-100 hover:to-teal-100 active:scale-95 transition-all shadow-xs shrink-0"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
                <span className="text-xs font-bold text-emerald-900 tracking-tight shrink-0">৬০ বার</span>
                {(inquiriesCount > 0 || myListingsCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer (৬০ বার ড্রয়ার) */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myListingsCount={myListingsCount}
        inquiriesCount={inquiriesCount}
        onOpenProfile={onOpenProfile || (() => {})}
        onOpenMultiAccount={onOpenMultiAccount || (() => {})}
        onOpenContacts={onOpenContacts || (() => {})}
        onOpenApkGuide={onOpenApkGuide || (() => {})}
      />
    </>
  );
};
