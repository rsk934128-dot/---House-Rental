import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  X, Search, UserPlus, Phone, Mail, Trash2, RefreshCw, 
  Users, CheckCircle2, AlertCircle, Building, Sparkles, MessageSquare, ExternalLink
} from 'lucide-react';
import { GoogleContactItem } from '../types';
import { 
  fetchGoogleContacts, 
  createGoogleContact, 
  deleteGoogleContact, 
  getCachedContacts 
} from '../services/contacts';
import { getAccessToken, googleSignIn } from '../services/auth';

interface GoogleContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectContact?: (contact: GoogleContactItem) => void;
  initialAddContact?: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    organization?: string;
  } | null;
}

export const GoogleContactsModal: React.FC<GoogleContactsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectContact,
  initialAddContact
}) => {
  const [contacts, setContacts] = useState<GoogleContactItem[]>(() => getCachedContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tenants' | 'landlords'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add Contact Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    phone: '',
    email: '',
    notes: '',
    jobTitle: 'ভাড়াটিয়া',
    organization: 'বাসা বাড়ি ভাড়া'
  });

  // Explicit User Confirmation Dialog State for Mutations
  const [confirmModal, setConfirmModal] = useState<{
    type: 'add' | 'delete';
    title: string;
    description: string;
    payload?: any;
  } | null>(null);

  // Pre-fill if initialAddContact is provided
  useEffect(() => {
    if (initialAddContact) {
      const parts = (initialAddContact.name || '').trim().split(' ');
      const given = parts[0] || '';
      const family = parts.slice(1).join(' ') || '';
      setFormData({
        givenName: given,
        familyName: family,
        phone: initialAddContact.phone || '',
        email: initialAddContact.email || '',
        notes: initialAddContact.notes || '',
        jobTitle: 'ভাড়াটিয়া / আবেদনকারী',
        organization: initialAddContact.organization || 'বাসা বাড়ি ভাড়া'
      });
      setIsAdding(true);
    }
  }, [initialAddContact]);

  // Load contacts when modal opens
  const loadContacts = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      let token = getAccessToken();
      if (!token) {
        // Try sign-in refresh
        const res = await googleSignIn(false);
        token = res?.accessToken || null;
      }

      if (!token) {
        throw new Error('গুগল কন্টাক্টস অ্যাক্সেস করতে অনুগ্রহ করে গুগল দিয়ে পুনরায় সাইন ইন করুন।');
      }

      const fetched = await fetchGoogleContacts(token);
      setContacts(fetched);
    } catch (err: any) {
      console.warn('Contacts load error:', err);
      setError(err?.message || 'কন্টাক্ট লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পারমিশন চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen, currentUser]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (filterType === 'tenants') {
      result = result.filter(c => 
        c.notes?.toLowerCase().includes('ভাড়াটিয়া') || 
        c.notes?.toLowerCase().includes('tenant') ||
        c.jobTitle?.toLowerCase().includes('ভাড়াটিয়া')
      );
    } else if (filterType === 'landlords') {
      result = result.filter(c => 
        c.notes?.toLowerCase().includes('বাড়িওয়ালা') || 
        c.notes?.toLowerCase().includes('landlord') ||
        c.jobTitle?.toLowerCase().includes('বাড়িওয়ালা')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [contacts, searchQuery, filterType]);

  // Initiate Add Contact with Mandatory User Confirmation
  const promptAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.givenName.trim()) {
      setError('অনুগ্রহ করে কন্টাক্টের নাম লিখুন।');
      return;
    }

    setConfirmModal({
      type: 'add',
      title: 'গুগল কন্টাক্টসে নতুন নম্বর সংরক্ষণ করবেন?',
      description: `"${formData.givenName} ${formData.familyName}". ফোন: ${formData.phone || 'দেওয়া হয়নি'}। এটি আপনার Google Contacts অ্যাকাউন্টে স্থায়ীভাবে যুক্ত হবে।`,
      payload: { ...formData }
    });
  };

  // Initiate Delete with Mandatory User Confirmation
  const promptDeleteContact = (contact: GoogleContactItem) => {
    setConfirmModal({
      type: 'delete',
      title: 'কন্টাক্ট ডিলিট নিশ্চিতকরণ',
      description: `আপনি কি নিশ্চিত যে "${contact.name}" কন্টাক্টটি আপনার Google Contacts থেকে মুছে ফেলতে চান? এই কাজটি আর পূর্বাবস্থায় ফেরানো যাবে না।`,
      payload: contact.resourceName
    });
  };

  // Execute Confirmed Action
  const executeConfirmedAction = async () => {
    if (!confirmModal) return;
    setError(null);
    setLoading(true);

    try {
      let token = getAccessToken();
      if (!token) {
        const res = await googleSignIn(false);
        token = res?.accessToken || null;
      }
      if (!token) throw new Error('গুগল অথেন্টিকেশন টোকেন পাওয়া যায়নি।');

      if (confirmModal.type === 'add') {
        const newContact = await createGoogleContact(token, confirmModal.payload);
        setContacts(prev => [newContact, ...prev]);
        setSuccessMessage(`"${newContact.name}" সফলভাবে আপনার Google Contacts-এ যুক্ত হয়েছে!`);
        setIsAdding(false);
        setFormData({
          givenName: '',
          familyName: '',
          phone: '',
          email: '',
          notes: '',
          jobTitle: 'ভাড়াটিয়া',
          organization: 'বাসা বাড়ি ভাড়া'
        });
      } else if (confirmModal.type === 'delete') {
        await deleteGoogleContact(token, confirmModal.payload);
        setContacts(prev => prev.filter(c => c.resourceName !== confirmModal.payload));
        setSuccessMessage('কন্টাক্ট সফলভাবে মুছে ফেলা হয়েছে।');
      }
    } catch (err: any) {
      setError(err?.message || 'অপারেশন সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
      setConfirmModal(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="google-contacts-modal"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">Google Contacts</h3>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">People API</span>
              </div>
              <p className="text-xs text-emerald-100">আপনার গুগল কন্টাক্টস ও বাসা ভাড়ার ফোন নম্বর পরিচালনা</p>
            </div>
          </div>
          <button
            id="close-contacts-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              {!currentUser && (
                <button
                  onClick={() => googleSignIn(true)}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700"
                >
                  গুগল লগইন করুন
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-contacts-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            <button
              id="refresh-contacts-btn"
              onClick={loadContacts}
              disabled={loading}
              title="রিফ্রেশ করুন"
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              id="toggle-add-contact-btn"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{isAdding ? 'তালিকা দেখুন' : 'নতুন কন্টাক্ট'}</span>
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">ফিল্টার:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              সব কন্টাক্ট ({contacts.length})
            </button>
            <button
              onClick={() => setFilterType('tenants')}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                filterType === 'tenants'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              🏡 ভাড়াটিয়া সংক্রান্ত
            </button>
            <button
              onClick={() => setFilterType('landlords')}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                filterType === 'landlords'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              🔑 বাড়িওয়ালা
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Add Contact Form */}
          {isAdding && (
            <form 
              onSubmit={promptAddContact}
              className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-3.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Google Contacts-এ যুক্ত করুন</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  বাতিল
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">প্রথম নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.givenName}
                    onChange={e => setFormData({ ...formData, givenName: e.target.value })}
                    placeholder="যেমন: তানভীর"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">শেষ নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={e => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="যেমন: আহমেদ"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিবরণ / নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="যেমন: ধানমন্ডি ৩ রুমের ফ্ল্যাটের ভাড়াটিয়া আবেদনকারী"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Google Contacts-এ সেভ করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* Contact List */}
          {loading && contacts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Google Contacts সিঙ্ক করা হচ্ছে...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">কোনো কন্টাক্ট পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery ? 'আপনার অনুসন্ধানের সাথে মিলছে এমন কোনো কন্টাক্ট পাওয়া যায়নি।' : 'আপনার Google Contacts তালিকায় নতুন ভাড়াটিয়া বা বাড়িওয়ালার নম্বর সেভ করতে "নতুন কন্টাক্ট" বাটনে ক্লিক করুন।'}
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
              >
                + নতুন কন্টাক্ট যোগ করুন
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredContacts.map(contact => {
                const isRentalTag = contact.notes?.toLowerCase().includes('ভাড়াটিয়া') || 
                                    contact.notes?.toLowerCase().includes('tenant') ||
                                    contact.jobTitle?.toLowerCase().includes('ভাড়াটিয়া');
                const isLandlordTag = contact.notes?.toLowerCase().includes('বাড়িওয়ালা') ||
                                      contact.notes?.toLowerCase().includes('landlord');

                return (
                  <div
                    key={contact.resourceName}
                    className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {contact.photoUrl ? (
                        <img 
                          src={contact.photoUrl} 
                          alt={contact.name} 
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{contact.name}</h4>
                          {isRentalTag && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                              ভাড়াটিয়া
                            </span>
                          )}
                          {isLandlordTag && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shrink-0">
                              বাড়িওয়ালা
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                          {contact.phone && (
                            <span className="flex items-center space-x-1 text-slate-700 font-medium">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{contact.phone}</span>
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center space-x-1 text-slate-500 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{contact.email}</span>
                            </span>
                          )}
                        </div>

                        {contact.notes && (
                          <p className="text-[11px] text-slate-500 truncate mt-1 italic">
                            "{contact.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      {contact.phone && (
                        <>
                          <a
                            href={`tel:${contact.phone}`}
                            title="সরাসরি কল করুন"
                            className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="হোয়াটসঅ্যাপ মেসেজ"
                            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}

                      {onSelectContact && (
                        <button
                          onClick={() => {
                            onSelectContact(contact);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                        >
                          নির্বাচন
                        </button>
                      )}

                      <button
                        onClick={() => promptDeleteContact(contact)}
                        title="Google Contacts থেকে ডিলিট করুন"
                        className="w-8 h-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>সিঙ্ক স্ট্যাটাস: সংযুক্ত (Google People API)</span>
          </div>
          <a 
            href="https://contacts.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-emerald-700 hover:underline font-semibold"
          >
            <span>contacts.google.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                confirmModal.type === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {confirmModal.type === 'delete' ? <Trash2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <h4 className="font-bold text-slate-900 text-base">{confirmModal.title}</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                disabled={loading}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmModal.type === 'delete' ? 'হ্যাঁ, ডিলিট করুন' : 'নিশ্চিত করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
