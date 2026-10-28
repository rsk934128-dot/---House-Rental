import React from 'react';
import { RentalInquiry } from '../types';
import { Mail, Phone, Calendar, CheckCircle2, Clock, User, Check, X, Users } from 'lucide-react';

interface InquiriesViewProps {
  inquiries: RentalInquiry[];
  onUpdateStatus: (id: string, newStatus: 'pending' | 'contacted' | 'booked' | 'rejected') => void;
  onSaveToContacts?: (inquiry: RentalInquiry) => void;
}

export const InquiriesView: React.FC<InquiriesViewProps> = ({ 
  inquiries, 
  onUpdateStatus,
  onSaveToContacts 
}) => {
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'অপেক্ষমাণ (Pending)', color: 'bg-amber-100 text-amber-800' },
    contacted: { label: 'যোগাযোগ সম্পন্ন (Contacted)', color: 'bg-blue-100 text-blue-800' },
    booked: { label: 'ভাড়া নিশ্চিত (Booked)', color: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: 'বাতিল (Rejected)', color: 'bg-slate-100 text-slate-700' }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ভাড়াটিয়াদের আবেদনপত্রসমূহ</h1>
          <p className="text-sm text-slate-500">আপনার বাসা ভাড়ার বিজ্ঞাপনে আসা সকল আবেদন ও যোগাযোগের তালিকা</p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200">
          মোট আবেদন: {inquiries.length} টি
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">এখনো কোনো আবেদন আসেনি</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            ভাড়াটিয়ারা আপনার বিজ্ঞাপন দেখে আবেদন করলে এখানে তালিকা দেখতে পারবেন এবং Gmail এ নোটিফিকেশন পাবেন।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusLabels[inquiry.status]?.color || 'bg-slate-100'}`}>
                    {statusLabels[inquiry.status]?.label || inquiry.status}
                  </span>
                  {inquiry.sentViaGmail && (
                    <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center space-x-1 font-medium">
                      <Mail className="w-3 h-3 text-red-500" />
                      <span>Gmail এ প্রেরিত</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(inquiry.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  বাসা: {inquiry.listingTitle}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span><strong>ভাড়াটিয়া:</strong> {inquiry.tenantName} {inquiry.profession ? `(${inquiry.profession})` : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span><strong>ফোন:</strong> <a href={`tel:${inquiry.tenantPhone}`} className="text-emerald-700 hover:underline">{inquiry.tenantPhone}</a></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span><strong>ইমেইল:</strong> {inquiry.tenantEmail}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span><strong>উঠতে চান:</strong> {inquiry.proposedMoveInDate}</span>
                  </div>
                </div>

                {inquiry.message && (
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 italic border-l-2 border-emerald-500 mt-2">
                    "{inquiry.message}"
                  </div>
                )}
              </div>

              {/* Status Change Buttons */}
              <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                <a
                  href={`tel:${inquiry.tenantPhone}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন</span>
                </a>

                {onSaveToContacts && (
                  <button
                    onClick={() => onSaveToContacts(inquiry)}
                    title="এই ভাড়াটিয়াকে Google Contacts-এ সেভ করুন"
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors border border-emerald-200"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কন্টাক্টসে সেভ</span>
                  </button>
                )}

                {inquiry.status !== 'booked' && (
                  <button
                    onClick={() => onUpdateStatus(inquiry.id, 'booked')}
                    className="px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ভাড়া নিশ্চিত</span>
                  </button>
                )}

                {inquiry.status !== 'contacted' && inquiry.status !== 'booked' && (
                  <button
                    onClick={() => onUpdateStatus(inquiry.id, 'contacted')}
                    className="px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>কথা বলেছি</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
