import React, { useState } from 'react';
import { HouseRentalListing, RentalInquiry } from '../types';
import { User } from 'firebase/auth';
import { sendRentalInquiryViaGmail } from '../services/gmail';
import { googleSignIn, getAccessToken } from '../services/auth';
import { X, Send, Mail, Phone, Calendar, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface InquiryModalProps {
  listing: HouseRentalListing | null;
  currentUser: User | null;
  userPhone?: string;
  onClose: () => void;
  onSubmitSuccess: (inquiry: RentalInquiry) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  listing,
  currentUser,
  userPhone,
  onClose,
  onSubmitSuccess
}) => {
  if (!listing) return null;

  const [tenantName, setTenantName] = useState(currentUser?.displayName || '');
  const [tenantPhone, setTenantPhone] = useState(userPhone || '');
  const [tenantEmail, setTenantEmail] = useState(currentUser?.email || '');
  const [familyMembers, setFamilyMembers] = useState<number | ''>(3);
  const [profession, setProfession] = useState('চাকরিজীবী');
  const [proposedMoveInDate, setProposedMoveInDate] = useState('১লা নভেম্বর ২০২৪');
  const [message, setMessage] = useState(
    `আসসালামু আলাইকুম, আমি আপনার "${listing.title}" বাসাটি ভাড়া নিতে আগ্রহী। অনুগ্রহ করে বাসাটি সরেজমিনে দেখার সময় জানাবেন।`
  );

  const [sendGmail, setSendGmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tenantName.trim()) {
      setErrorMsg('আপনার নাম আবশ্যক।');
      return;
    }
    if (!tenantPhone.trim()) {
      setErrorMsg('আপনার মোবাইল নম্বর আবশ্যক।');
      return;
    }
    if (!tenantEmail.trim()) {
      setErrorMsg('আপনার ইমেইল আবশ্যক।');
      return;
    }

    setIsLoading(true);

    let sentViaGmail = false;

    // If user selected Gmail and is logged in with token
    if (sendGmail) {
      let token = getAccessToken();
      if (!token && !currentUser) {
        // Prompt login if needed
        try {
          const authRes = await googleSignIn();
          token = authRes?.accessToken || null;
        } catch (authErr) {
          console.warn('Google sign in canceled or failed:', authErr);
        }
      }

      if (token) {
        const gmailRes = await sendRentalInquiryViaGmail({
          toEmail: listing.landlordEmail,
          toName: listing.landlordName,
          fromName: tenantName.trim(),
          fromEmail: tenantEmail.trim(),
          fromPhone: tenantPhone.trim(),
          listingTitle: listing.title,
          proposedMoveInDate: proposedMoveInDate.trim(),
          familyMembers: familyMembers ? Number(familyMembers) : undefined,
          profession: profession.trim(),
          userMessage: message.trim()
        });

        if (gmailRes.success) {
          sentViaGmail = true;
        } else {
          console.warn('Gmail sending note:', gmailRes.error);
        }
      }
    }

    const newInquiry: RentalInquiry = {
      id: `inquiry-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      tenantName: tenantName.trim(),
      tenantPhone: tenantPhone.trim(),
      tenantEmail: tenantEmail.trim(),
      familyMembers: familyMembers ? Number(familyMembers) : undefined,
      profession: profession.trim(),
      proposedMoveInDate: proposedMoveInDate.trim(),
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      sentViaGmail,
      tenantUid: currentUser?.uid || undefined
    };

    setIsLoading(false);
    onSubmitSuccess(newInquiry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        id="inquiry-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">ভাড়া নেওয়ার আবেদনপত্র</span>
            <h2 className="text-lg font-bold text-white mt-0.5">বাড়িওয়ালার কাছে মেসেজ ও তথ্য পাঠান</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected House Brief */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center space-x-3">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{listing.title}</h4>
            <div className="flex items-center text-[11px] text-slate-500 mt-0.5 space-x-2">
              <span>বাড়িওয়ালা: {listing.landlordName}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">৳ {listing.rentAmount.toLocaleString('bn-BD')} /মাস</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">আপনার পূর্ণ নাম *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="যেমন: সাকিব হাসান"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">মোবাইল নম্বর *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">আপনার ইমেইল *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">পরিবারের সদস্য সংখ্যা</label>
              <input
                type="number"
                value={familyMembers}
                onChange={(e) => setFamilyMembers(e.target.value ? Number(e.target.value) : '')}
                placeholder="৩"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">পেশা</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="চাকরিজীবী/ব্যবসায়ী"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">কবে উঠতে চান?</label>
              <input
                type="text"
                value={proposedMoveInDate}
                onChange={(e) => setProposedMoveInDate(e.target.value)}
                placeholder="১লা নভেম্বর"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">বাড়িওয়ালার প্রতি আপনার বার্তা বা বিশেষ শর্ত</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden"
            />
          </div>

          {/* Gmail integration badge & toggle */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <input
              id="checkbox-gmail"
              type="checkbox"
              checked={sendGmail}
              onChange={(e) => setSendGmail(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="checkbox-gmail" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <span>বাড়িওয়ালার Gmail এ সরাসরি ইমেইল নোটিফিকেশন পাঠান</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Google Workspace / Gmail এর মাধ্যমে বাড়িওয়ালার ({listing.landlordEmail}) ঠিকানায় আপনার সমস্ত তথ্যসহ পেশাদার ইমেইল পৌঁছাবে।
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              id="btn-confirm-inquiry"
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'আবেদন পাঠানো হচ্ছে...' : 'আবেদনপত্র জমা দিন'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
