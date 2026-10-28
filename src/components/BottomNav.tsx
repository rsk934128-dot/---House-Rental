import React from 'react';
import { Home, PlusCircle, Inbox, Users, User as UserIcon, BarChart2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface BottomNavProps {
  activeTab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics';
  setActiveTab: (tab: 'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics') => void;
  inquiriesCount: number;
  myListingsCount: number;
  currentUser: User | null;
  onOpenProfile: () => void;
  onOpenContacts: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  inquiriesCount,
  currentUser,
  onOpenProfile,
  onOpenContacts
}) => {
  return (
    <nav 
      aria-label="মোবাইল নেভিগেশন বার"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center justify-around h-15 px-2">
        
        {/* Tab 1: Browse */}
        <button
          id="mobile-nav-browse"
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'browse'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'browse' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5">বাসা খুঁজুন</span>
        </button>

        {/* Tab 2: Post Listing (Prominent Center-like CTA) */}
        <button
          id="mobile-nav-post"
          onClick={() => setActiveTab('post')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'post'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'post' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600'}`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5">বিজ্ঞাপন দিন</span>
        </button>

        {/* Tab 3: Inquiries */}
        <button
          id="mobile-nav-inquiries"
          onClick={() => setActiveTab('inquiries')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            activeTab === 'inquiries'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors relative ${activeTab === 'inquiries' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
            <Inbox className="w-5 h-5" />
            {inquiriesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                {inquiriesCount > 9 ? '9+' : inquiriesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5">আবেদনপত্র</span>
        </button>

        {/* Tab 4: Google Contacts */}
        <button
          id="mobile-nav-contacts"
          onClick={onOpenContacts}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-emerald-700 transition-all active:scale-95"
        >
          <div className="p-1 rounded-xl hover:bg-emerald-50 text-slate-600">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5">কন্টাক্টস</span>
        </button>

        {/* Tab 5: Profile / Menu */}
        <button
          id="mobile-nav-profile"
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-emerald-700 transition-all active:scale-95"
        >
          <div className="p-0.5 rounded-full overflow-hidden">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'ব্যবহারকারী'}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5">প্রোফাইল</span>
        </button>

      </div>
    </nav>
  );
};
