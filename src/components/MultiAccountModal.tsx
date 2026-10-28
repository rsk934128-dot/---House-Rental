import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { SavedGoogleAccount, UserProfile } from '../types';
import { 
  X, CheckCircle2, UserPlus, LogOut, Trash2, ArrowRightLeft, 
  ShieldCheck, AlertCircle, RefreshCw, Mail, Phone, Building
} from 'lucide-react';
import { 
  googleSignIn, 
  switchGoogleAccount, 
  logout, 
  removeSavedGoogleAccount, 
  getSavedGoogleAccounts 
} from '../services/auth';

interface MultiAccountModalProps {
  isOpen: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  onClose: () => void;
  onAccountSwitched?: () => void;
}

export const MultiAccountModal: React.FC<MultiAccountModalProps> = ({
  isOpen,
  currentUser,
  userProfile,
  onClose,
  onAccountSwitched
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(() => getSavedGoogleAccounts());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshAccounts = () => {
    setSavedAccounts(getSavedGoogleAccounts());
  };

  const handleSwitchToAnotherGoogleAccount = async () => {
    try {
      setLoadingAction('switch');
      const res = await switchGoogleAccount();
      if (res?.user) {
        refreshAccounts();
        if (onAccountSwitched) onAccountSwitched();
        onClose();
      }
    } catch (e) {
      console.warn('Switch account error:', e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveSaved = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    const updated = removeSavedGoogleAccount(uid);
    setSavedAccounts(updated);
  };

  const handleSignOutCurrent = async () => {
    try {
      setLoadingAction('signout');
      await logout();
      refreshAccounts();
      if (onAccountSwitched) onAccountSwitched();
      onClose();
    } catch (e) {
      console.warn('Signout error:', e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div 
      id="multi-account-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="multi-account-modal" 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
              <ArrowRightLeft className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                মাল্টি অ্যাকাউন্ট গুগল লগইন
              </h3>
              <p className="text-xs text-slate-300">
                একাধিক গুগল একাউন্ট অদলবদল ও পরিচালনা করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Current Active Account Section */}
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  বর্তমান সক্রিয় অ্যাকাউন্ট
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>সক্রিয় (Active)</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="w-12 h-12 rounded-2xl ring-2 ring-emerald-500 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shrink-0">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {userProfile?.displayName || currentUser.displayName}
                    </h4>
                    <p className="text-xs text-slate-600 truncate flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{currentUser.email}</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.2 rounded-md">
                        {userProfile?.role === 'landlord' ? 'বাড়িওয়ালা' : userProfile?.role === 'tenant' ? 'ভাড়াটিয়া' : 'উভয় ভূমিকা'}
                      </span>
                      {userProfile?.phone && (
                        <span className="text-[10px] text-slate-500 flex items-center">
                          <Phone className="w-2.5 h-2.5 mr-0.5" />
                          {userProfile.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSignOutCurrent}
                  disabled={loadingAction === 'signout'}
                  title="বর্তমান অ্যাকাউন্ট থেকে সাইন আউট করুন"
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                বর্তমানে কোনো গুগল অ্যাকাউন্ট দিয়ে লগইন করা নেই। নিচে থেকে আপনার গুগল অ্যাকাউন্ট নির্বাচন করুন।
              </p>
            </div>
          )}

          {/* Switch to Another Google Account Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                গুগল মাল্টি অ্যাকাউন্ট অ্যাকশন
              </span>
            </div>

            <button
              id="btn-switch-google-account"
              onClick={handleSwitchToAnotherGoogleAccount}
              disabled={loadingAction === 'switch'}
              className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all shadow-sm active:scale-[0.99]"
            >
              {loadingAction === 'switch' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>গুগল অ্যাকাউন্ট খোলা হচ্ছে...</span>
                </>
              ) : (
                <>
                  {/* Google 4-Color Icon */}
                  <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>অন্য গুগল অ্যাকাউন্ট বেছে নিন / সুইচ করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Previously Logged-in Accounts on this Device */}
          {savedAccounts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  এই ডিভাইসে সংরক্ষিত গুগল অ্যাকাউন্ট ({savedAccounts.length})
                </span>
                <span className="text-[11px] text-slate-400">দ্রুত পরিবর্তন</span>
              </div>

              <div className="space-y-2">
                {savedAccounts.map((acc) => {
                  const isCurrent = currentUser?.uid === acc.uid;
                  return (
                    <div
                      key={acc.uid}
                      onClick={() => !isCurrent && handleSwitchToAnotherGoogleAccount()}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-emerald-50/30 border-emerald-200 cursor-default' 
                          : 'bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border-slate-200 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {acc.photoURL ? (
                          <img 
                            src={acc.photoURL} 
                            alt={acc.displayName} 
                            className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {acc.displayName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate flex items-center space-x-1.5">
                            <span>{acc.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                বর্তমান
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {!isCurrent && (
                          <>
                            <span className="text-[11px] font-semibold text-emerald-700 group-hover:underline hidden sm:inline mr-1">
                              সুইচ করুন
                            </span>
                            <button
                              onClick={(e) => handleRemoveSaved(e, acc.uid)}
                              title="তালিকা থেকে সরান"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help & Multi-Account Information */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>মাল্টি অ্যাকাউন্ট কেন সুবিধাজনক?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              আপনি একাউন্ট সুইচারের মাধ্যমে বাড়িওয়ালা হিসেবে বিজ্ঞাপন প্রকাশের গুগল অ্যাকাউন্ট এবং সাধারণ ব্যবহারকারী হিসেবে বাসা খোঁজার গুগল অ্যাকাউন্ট আলাদাভাবে ব্যবহার করতে পারবেন।
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
