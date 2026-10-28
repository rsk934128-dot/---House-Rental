import React, { useState } from 'react';
import { HouseRentalListing } from '../types';
import { 
  X, MapPin, Bed, Bath, Maximize2, Check, Flame, Shield, 
  Car, Wifi, Phone, Mail, Clock, Calendar, ExternalLink, Send, Eye, Users, Sparkles
} from 'lucide-react';
import { HouseLocationMap } from './HouseLocationMap';
import { isFeaturedListing } from './HouseCard';

interface HouseDetailModalProps {
  listing: HouseRentalListing | null;
  onClose: () => void;
  onOpenInquiry: (listing: HouseRentalListing) => void;
  onSaveLandlordToContacts?: (contact: { name: string; phone: string; email?: string; notes?: string }) => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  listing,
  onClose,
  onOpenInquiry,
  onSaveLandlordToContacts
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [listing?.id]);

  if (!listing) return null;

  const propertyTypeLabel: Record<string, string> = {
    family: 'পারিবারিক ফ্ল্যাট (Family)',
    bachelor: 'ব্যাচেলর বাসা (Bachelor)',
    sublet: 'সাবলেট রুম (Sublet)',
    office: 'অফিস স্পেস (Commercial)',
    hostel: 'হোস্টেল রুম (Hostel)',
  };

  const gasLabel: Record<string, string> = {
    line: 'সরকারি লাইন গ্যাস (সার্বক্ষণিক)',
    cylinder: 'সিলিন্ডার গ্যাস সুবিধা',
    none: 'গ্যাস সংযোগ নেই'
  };

  const parkingLabel: Record<string, string> = {
    car: 'গাড়ি পার্কিং সুবিধা',
    bike: 'মোটরসাইকেল পার্কিং',
    both: 'গাড়ি ও বাইক উভয় পার্কিং',
    none: 'পার্কিং সুবিধা নেই'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        id="house-detail-modal"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {isFeaturedListing(listing) && (
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm ring-1 ring-amber-400/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-100 fill-amber-100 animate-pulse" />
                <span>ফিচার্ড লিস্টিং</span>
              </span>
            )}
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              {propertyTypeLabel[listing.propertyType] || listing.propertyType}
            </span>
            <span className="text-slate-500 text-xs sm:text-sm">আইডি: #{listing.id}</span>
            {listing.viewCount !== undefined && (
              <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-slate-200">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>{listing.viewCount} বার দেখা হয়েছে</span>
              </span>
            )}
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Main Photo & Thumbnails */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-contain sm:object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                ছবি {activeImageIndex + 1} / {listing.images.length}
              </div>
            </div>

            {/* Thumbnail previews */}
            {listing.images.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {listing.title}
              </h2>
              <div className="flex items-center text-slate-500 text-sm mt-1.5">
                <MapPin className="w-4 h-4 text-rose-500 mr-1 shrink-0" />
                <span>{listing.fullAddress}</span>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl text-left md:text-right shrink-0">
              <div className="text-xs text-emerald-800 font-medium">মাসিক ভাড়া</div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                ৳ {listing.rentAmount.toLocaleString('bn-BD')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {listing.serviceCharge ? `+ সার্ভিস চার্জ ৳${listing.serviceCharge.toLocaleString('bn-BD')}` : 'কোন সার্ভিস চার্জ নেই'}
              </div>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-2xs">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">বেডরুম</p>
                <p className="text-sm font-bold text-slate-800">{listing.bedrooms} টি শোবার ঘর</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-2xs">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">বাথরুম</p>
                <p className="text-sm font-bold text-slate-800">{listing.bathrooms} টি বাথরুম</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-2xs">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">আয়তন</p>
                <p className="text-sm font-bold text-slate-800">{listing.sizeSqFt} বর্গফুট</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">ভাড়া দেওয়া হবে</p>
                <p className="text-sm font-bold text-slate-800">{listing.availableFrom}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900">বাসার বিবরণ:</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {listing.description}
            </p>
          </div>

          {/* Amenities & Features */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900">সুবিধাসমূহ ও সুযোগ-সুবিধা:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{gasLabel[listing.gasFacility]}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                <Car className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{parkingLabel[listing.parking]}</span>
              </div>
              {listing.lift && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>লিফট সুবিধা (Lift)</span>
                </div>
              )}
              {listing.generator && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>জেনারেটর ব্যাকআপ (বিদ্যুৎ)</span>
                </div>
              )}
              {listing.securityGuard && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>২৪ ঘণ্টা সার্বক্ষণিক নিরাপত্তা প্রহরী</span>
                </div>
              )}
              {listing.cctv && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>সিসিটিভি ক্যামেরা সার্ভেইল্যান্স</span>
                </div>
              )}
              {listing.wifi && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>হাই-স্পিড ইন্টারনেট/ওয়াইফাই রেডি</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>অবস্থান: {listing.floor} {listing.totalFloors ? `(${listing.totalFloors} এর মধ্যে)` : ''}</span>
              </div>
              {listing.advanceDeposit ? (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl font-medium">
                  <span className="text-emerald-700 font-bold">অগ্রিম জামানত:</span>
                  <span>৳ {listing.advanceDeposit.toLocaleString('bn-BD')}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Location Details & Interactive Google Maps Preview */}
          <div className="space-y-3">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5 mb-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>লোকেশন ও আশপাশের সুবিধা:</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700">
                <strong>ঠিকানা:</strong> {listing.fullAddress}
              </p>
              {listing.landmark && (
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  <strong>ল্যান্ডমার্ক:</strong> {listing.landmark}
                </p>
              )}
            </div>

            {/* Google Maps Visual Preview Component */}
            <HouseLocationMap
              latitude={listing.latitude}
              longitude={listing.longitude}
              title={listing.title}
              address={listing.fullAddress}
            />
          </div>

          {/* Landlord Contact Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">বাড়িওয়ালার তথ্য</span>
              <h4 className="text-lg font-bold text-white mt-0.5">{listing.landlordName}</h4>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{listing.landlordPhone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{listing.landlordEmail}</span>
                </span>
                {listing.contactTime && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{listing.contactTime}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <a
                href={`tel:${listing.landlordPhone}`}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>সরাসরি কল করুন</span>
              </a>

              {onSaveLandlordToContacts && (
                <button
                  type="button"
                  onClick={() => onSaveLandlordToContacts({
                    name: listing.landlordName,
                    phone: listing.landlordPhone,
                    email: listing.landlordEmail,
                    notes: `বাড়িওয়ালা - ${listing.title} (${listing.fullAddress})`
                  })}
                  className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 border border-emerald-600/50"
                  title="Google Contacts-এ বাড়িওয়ালার নম্বর সংরক্ষণ করুন"
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>কন্টাক্টসে সেভ</span>
                </button>
              )}

              <button
                id="btn-modal-inquiry"
                onClick={() => {
                  onClose();
                  onOpenInquiry(listing);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>ভাড়া নেওয়ার আবেদন</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
