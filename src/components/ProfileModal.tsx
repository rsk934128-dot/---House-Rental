import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, HouseRentalListing, RentalInquiry } from '../types';
import { logout, googleSignIn } from '../services/auth';
import { 
  User as UserIcon, Shield, Mail, Phone, MapPin, Building, 
  CheckCircle2, AlertCircle, Save, LogOut, FileText, Send, 
  Sparkles, Check, KeyRound, ExternalLink, Calendar, Eye, BarChart2, ArrowRightLeft, Users,
  Smartphone, Download, BellRing
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  profile: UserProfile | null;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
  userListingsCount: number;
  userInquiriesCount: number;
  totalViewsCount?: number;
  onNavigateToMyListings: () => void;
  onNavigateToInquiries: () => void;
  onNavigateToAnalytics?: () => void;
  onOpenMultiAccount?: () => void;
  onOpenContacts?: () => void;
  onOpenApkGuide?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profile,
  onSaveProfile,
  userListingsCount,
  userInquiriesCount,
  totalViewsCount = 0,
  onNavigateToMyListings,
  onNavigateToInquiries,
  onNavigateToAnalytics,
  onOpenMultiAccount,
  onOpenContacts,
  onOpenApkGuide
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [role, setRole] = useState<'landlord' | 'tenant' | 'both'>(profile?.role || 'both');
  const [nidNumber, setNidNumber] = useState(profile?.nidNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [preferredCity, setPreferredCity] = useState(profile?.preferredCity || 'ঢাকা');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [notificationEmail, setNotificationEmail] = useState(profile?.notificationEmail ?? true);
  const [dailyEmailSummary, setDailyEmailSummary] = useState(profile?.dailyEmailSummary ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'security'>('info');

  // Mobile Auth state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mobileAuthNotice, setMobileAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleNotice = (e: any) => {
      if (e.detail?.message) {
        setMobileAuthNotice(e.detail.message);
      }
    };
    window.addEventListener('auth-mobile-notice', handleNotice);
    return () => window.removeEventListener('auth-mobile-notice', handleNotice);
  }, []);

  const handleMobileSignIn = async () => {
    try {
      setIsSigningIn(true);
      setMobileAuthNotice(null);
      await googleSignIn();
    } catch (err: any) {
      console.warn('Mobile sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || currentUser?.displayName || '');
      setPhone(profile.phone || '');
      setRole(profile.role || 'both');
      setNidNumber(profile.nidNumber || '');
      setWhatsappNumber(profile.whatsappNumber || '');
      setAddress(profile.address || '');
      setPreferredCity(profile.preferredCity || 'ঢাকা');
      setOccupation(profile.occupation || '');
      setBio(profile.bio || '');
      setNotificationEmail(profile.notificationEmail ?? true);
      setDailyEmailSummary(profile.dailyEmailSummary ?? true);
    } else if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [profile, currentUser]);

  if (!isOpen) return null;

  // Dedicated Mobile Login Screen if unauthenticated
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 my-auto flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white relative text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-3 shadow-inner">
              <Smartphone className="w-7 h-7 text-emerald-300" />
            </div>

            <h3 className="text-xl font-bold text-white">মোবাইল লগইন</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              গুগল একাউন্ট দিয়ে সহজেই সাইন ইন করে বাড়ি ভাড়ার সমস্ত সুবিধা উপভোগ করুন
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {mobileAuthNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{mobileAuthNotice}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              id="btn-mobile-login-modal-signin"
              onClick={handleMobileSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              <div className="w-5 h-5 bg-white rounded-full p-0.5 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span>{isSigningIn ? 'লগইন হচ্ছে...' : 'Google দিয়ে সরাসরি সাইন ইন'}</span>
            </button>

            {onOpenMultiAccount && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMultiAccount();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>মাল্টি অ্যাকাউন্ট তালিকা ও অ্যাকাউন্ট যোগ</span>
              </button>
            )}

            {/* Feature Highlights */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">লগইন করলে যেসব সুবিধা পাবেন:</span>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>নিজের বাড়ি ভাড়ার বিজ্ঞাপন ছবিসহ প্রকাশ ও এডিট</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ভাড়াটিয়াদের পাঠানো বুকিং মেসেজ ও আবেদনপত্র দেখা</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>বিজ্ঞাপনের ভিউ কাউন্ট ও দৈনিক ইমেইল সারসংক্ষেপ</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Google Contacts-এ মোবাইল নম্বর সরাসরি সিঙ্ক ও সেভ</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                পরে লগইন করব, এখন ঘুরে দেখুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updated: UserProfile = {
      uid: currentUser.uid,
      displayName: displayName.trim() || currentUser.displayName || 'ব্যবহারকারী',
      email: currentUser.email || '',
      phone: phone.trim() || undefined,
      role,
      nidNumber: nidNumber.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
      address: address.trim() || undefined,
      preferredCity: preferredCity.trim() || undefined,
      occupation: occupation.trim() || undefined,
      bio: bio.trim() || undefined,
      notificationEmail,
      dailyEmailSummary,
      verifiedIdentity: profile?.verifiedIdentity || false,
      joinedAt: profile?.joinedAt || new Date().toISOString().split('T')[0]
    };

    try {
      await onSaveProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-2xl ring-4 ring-emerald-400/30 object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-bold text-3xl flex items-center justify-center ring-4 ring-emerald-400/30 shadow-lg">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h3 className="text-xl font-bold text-white">{displayName || 'নামহীন ব্যবহারকারী'}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  যাচাইকৃত গুগল একাউন্ট
                </span>
              </div>
              
              <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start space-x-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.email}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-white/15 text-white font-medium">
                  ভূমিকা: {role === 'landlord' ? 'বাড়িওয়ালা (Landlord)' : role === 'tenant' ? 'ভাড়াটিয়া (Tenant)' : 'বাড়িওয়ালা ও ভাড়াটিয়া'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-200 border border-emerald-500/30">
                  যুক্ত হয়েছেন: {profile?.joinedAt || 'নতুন'}
                </span>
                {onOpenMultiAccount && (
                  <button
                    id="btn-profile-multi-account"
                    onClick={() => {
                      onClose();
                      onOpenMultiAccount();
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold flex items-center space-x-1 transition-colors shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>অ্যাকাউন্ট সুইচ</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex space-x-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              প্রোফাইল তথ্য ও সেটিংস
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'activity'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              কার্যক্রম ও সারসংক্ষেপ
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              নিরাপত্তা ও একাউন্ট
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {saveSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>আপনার প্রোফাইল তথ্য সফলভাবে হালনাগাদ ও ফায়ারস্টোরে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  আপনার প্রাথমিক পরিচয় / ভূমিকা
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('both')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      role === 'both'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    উভয় (বাড়িওয়ালা ও ভাড়াটিয়া)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      role === 'landlord'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    বাড়িওয়ালা (বাসা দেব)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tenant')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      role === 'tenant'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ভাড়াটিয়া (বাসা নেব)
                  </button>
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সম্পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="আপনার নাম"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="০১XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    হোয়াটসঅ্যাপ নম্বর (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="০১XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পেশা / পদবী
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার, ব্যবসায়ী, চাকরিজীবী"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পছন্দের শহর
                  </label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="বরিশাল">বরিশাল</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জাতীয় পরিচয়পত্র নম্বর (NID - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="নিরাপত্তা যাচাইয়ের জন্য NID"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বর্তমান ঠিকানা
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="যেমন: বাড়ি # ১২, রোড # ৪, ব্লক # বি, মিরপুর, ঢাকা"
                />
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নিজের সম্পর্কে সংক্ষিপ্ত বিবরণ (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="বাড়িওয়ালা বা ভাড়াটিয়াদের সাথে যোগাযোগের জন্য কিছু তথ্য..."
                />
              </div>

              {/* Notification & Daily Email Summary Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                  <BellRing className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ইমেইল নোটিফিকেশন ও ডাইজেস্ট সেটিংস
                  </span>
                </div>

                {/* 1. Daily Email Summary of New Inquiries (Requested Feature) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5 shadow-2xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            বিজ্ঞাপনের দৈনিক ইমেইল সারসংক্ষেপ (Daily Inquiry Summary)
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dailyEmailSummary 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {dailyEmailSummary ? '✓ চালু আছে' : 'বন্ধ'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          আপনার বিজ্ঞাপনে আসা নতুন সকল ভাড়াটিয়ার আবেদনপত্র (Inquiries), যোগাযোগ নম্বর এবং ভিউ সংখ্যার একটি পূর্ণাঙ্গ দৈনিক সামারি প্রতিদিন আপনার গুগল ইমেইলে ({currentUser.email}) পাঠানো হবে।
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        id="toggle-daily-email-summary"
                        checked={dailyEmailSummary}
                        onChange={(e) => setDailyEmailSummary(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {dailyEmailSummary && (
                    <div className="text-[11px] bg-white/90 p-2.5 rounded-xl border border-emerald-100 text-emerald-900 flex items-center space-x-2 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>প্রতিদিন সকাল ৯:০০ টায় আপনার বিজ্ঞাপনে আসা নতুন আবেদনপত্রের সারসংক্ষেপ ইনবক্সে পাবেন।</span>
                    </div>
                  )}
                </div>

                {/* 2. Instant Inquiry Alert Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-800">তাত্ক্ষণিক ইমেইল নোটিফিকেশন</p>
                    <p className="text-[11px] text-slate-500">
                      কোনো ভাড়াটিয়া নতুন বুকিং আবেদন পাঠালে সাথে সাথে ইমেইল এলার্ট পাবেন।
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-instant-email-notification"
                    checked={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => {
                    onClose();
                    onNavigateToMyListings();
                  }}
                  className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <span className="text-xl font-black text-emerald-700 font-mono">{userListingsCount}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">বিজ্ঞাপন</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">বাসার তালিকা দেখুন</p>
                </div>

                <div 
                  onClick={() => {
                    onClose();
                    if (onNavigateToAnalytics) onNavigateToAnalytics();
                  }}
                  className="p-4 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-xl font-black text-blue-700 font-mono">{totalViewsCount}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">মোট ভিউয়ার্স</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">অ্যানালিটিক্স দেখুন</p>
                </div>

                <div 
                  onClick={() => {
                    onClose();
                    onNavigateToInquiries();
                  }}
                  className="p-4 bg-teal-50 rounded-2xl border border-teal-100 cursor-pointer hover:bg-teal-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Send className="w-5 h-5 text-teal-600" />
                    <span className="text-xl font-black text-teal-700 font-mono">{userInquiriesCount}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">আবেদনপত্র</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">বার্তা ও আবেদন</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  একাউন্ট নিরাপত্তা ও অবস্থা
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                    <span>গুগল প্রমাণীকরণ (Google Auth):</span>
                    <span className="text-emerald-700 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> সক্রিয়
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                    <span>ফায়ারস্টোর ডাটাবেস সিঙ্ক:</span>
                    <span className="text-emerald-700 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> সংযুক্ত (Cloud Sync)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span>ইউনিক ইউজার আইডি (UID):</span>
                    <span className="font-mono text-slate-800 text-[11px] truncate max-w-[180px]">
                      {currentUser.uid}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              {/* Multi-Account Switch Box */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                    <span>মাল্টি অ্যাকাউন্ট কন্ট্রোল (Multi-Account Switch)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনার কি একাধিক গুগল একাউন্ট রয়েছে (যেমন বাড়িওয়ালা ও ব্যক্তিগত)? খুব সহজেই একটি ক্লিক করেই অন্য গুগল একাউন্টে পরিবর্তন করতে পারবেন।
                </p>
                {onOpenMultiAccount && (
                  <button
                    id="btn-switch-account-security-tab"
                    onClick={() => {
                      onClose();
                      onOpenMultiAccount();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>অন্য গুগল অ্যাকাউন্টে সুইচ করুন</span>
                  </button>
                )}
              </div>

              {/* Google Contacts Integration Box */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <Users className="w-5 h-5 text-teal-600" />
                    <span>Google Contacts ইন্টিগ্রেশন (People API)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    সংযুক্ত
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনার Google Contacts-এর সাথে সরাসরি সংযুক্ত। ভাড়াটিয়াদের আবেদনের নম্বর বা বাড়িওয়ালাদের ফোন নম্বর সরাসরি আপনার ফোনে সেভ করুন এবং পরিচালনা করুন।
                </p>
                {onOpenContacts && (
                  <button
                    id="btn-open-contacts-profile-tab"
                    onClick={() => {
                      onClose();
                      onOpenContacts();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Users className="w-4 h-4" />
                    <span>Google Contacts তালিকা খুলুন</span>
                  </button>
                )}
              </div>

              {/* Android APK & Mobile App Release Section */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl border border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-sm text-white">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Android APK রিলিজ ও মোবাইল অ্যাপ সেন্টার</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    GitHub CI/CD
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আমাদের অ্যাপটি সম্পূর্ণ মোবাইল ফ্রেন্ডলি। GitHub Actions এর মাধ্যমে স্বয়ংক্রিয়ভাবে Android APK বিল্ড ও রিলিজ তৈরি করা হয়, যা সরাসরি ফোনে ইনস্টল করে ব্যবহার করা যায়।
                </p>
                {onOpenApkGuide && (
                  <button
                    id="btn-open-apk-guide-profile"
                    onClick={() => {
                      onClose();
                      onOpenApkGuide();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>APK রিলিজ ও মোবাইল ইনস্টল গাইড দেখুন</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>একাউন্টের নিরাপত্তা ও প্রমাণীকরণ</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনার একাউন্টটি সুরক্ষিত Google OAuth এবং Firebase Security Rules দ্বারা সংরক্ষিত।
                  আপনার নিজস্ব বিজ্ঞাপন এবং আবেদন শুধুমাত্র আপনি সম্পাদন বা মুছে ফেলতে পারেন।
                </p>
              </div>

              <div className="p-4 border border-rose-100 bg-rose-50/50 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-rose-900">লগআউট করুন</h5>
                  <p className="text-[11px] text-rose-700">বর্তমান ডিভাইস থেকে আপনার একাউন্টটি সাইন আউট করুন</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>সাইন আউট</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
