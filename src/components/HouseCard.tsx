import React from 'react';
import { HouseRentalListing } from '../types';
import { MapPin, Bed, Bath, Maximize2, ShieldCheck, Flame, Phone, Eye, Sparkles } from 'lucide-react';

interface HouseCardProps {
  listing: HouseRentalListing;
  onSelect: (listing: HouseRentalListing) => void;
  onOpenInquiry: (listing: HouseRentalListing) => void;
}

export const isFeaturedListing = (listing: HouseRentalListing): boolean => {
  if (listing.isFeatured) return true;
  // High view counts (e.g. >= 140 views)
  if (typeof listing.viewCount === 'number' && listing.viewCount >= 140) return true;
  // Premium criteria: verified with solid view counts (>= 100 views)
  if (listing.verified && typeof listing.viewCount === 'number' && listing.viewCount >= 100) return true;
  return false;
};

export const HouseCard: React.FC<HouseCardProps> = ({ listing, onSelect, onOpenInquiry }) => {
  const propertyTypeLabel: Record<string, string> = {
    family: 'পরিবার (Family)',
    bachelor: 'ব্যাচেলর (Bachelor)',
    sublet: 'সাবলেট (Sublet)',
    office: 'অফিস স্পেস (Office)',
    hostel: 'হোস্টেল (Hostel)',
  };

  const gasLabel: Record<string, string> = {
    line: 'লাইন গ্যাস',
    cylinder: 'সিলিন্ডার',
    none: 'গ্যাস নেই'
  };

  const isFeatured = isFeaturedListing(listing);

  return (
    <div 
      id={`house-card-${listing.id}`}
      className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden flex flex-col group relative ${
        isFeatured 
          ? 'border-2 border-amber-300/90 shadow-sm hover:shadow-xl hover:border-amber-400 ring-2 ring-amber-400/20' 
          : 'border border-slate-200 shadow-xs hover:shadow-lg'
      }`}
    >
      {/* Photo carousel / Preview image */}
      <div 
        className="relative h-56 sm:h-60 w-full overflow-hidden cursor-pointer bg-slate-100"
        onClick={() => onSelect(listing)}
      >
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {/* Featured Badge */}
          {isFeatured && (
            <span 
              id={`featured-badge-${listing.id}`}
              title="ফিচার্ড লিস্টিং - অধিক ভিউ ও মানসম্মত প্রিমিয়াম বাসা"
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md shadow-amber-500/30 border border-amber-300/50 backdrop-blur-xs ring-1 ring-amber-400/40 transition-transform group-hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100 fill-amber-100 animate-pulse" />
              <span>ফিচার্ড</span>
            </span>
          )}

          <span className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
            {propertyTypeLabel[listing.propertyType] || listing.propertyType}
          </span>
          {listing.verified && (
            <span className="bg-blue-600/90 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>যাচাইকৃত</span>
            </span>
          )}
        </div>

        {/* Photo Count & View Count */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          {listing.viewCount !== undefined && (
            <div 
              title={`${listing.viewCount} বার দেখা হয়েছে`}
              className={`text-xs px-2 py-0.5 rounded-md backdrop-blur-xs font-mono flex items-center space-x-1 ${
                isFeatured 
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-400/40 shadow-xs' 
                  : 'bg-black/60 text-white'
              }`}
            >
              <Eye className={`w-3 h-3 ${isFeatured ? 'text-amber-300' : 'text-emerald-400'}`} />
              <span>{listing.viewCount}</span>
            </div>
          )}
          <div className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
            📷 {listing.images.length}
          </div>
        </div>

        {/* Bottom Price & Available From */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <div className="text-2xl font-bold tracking-tight text-white drop-shadow-xs">
              ৳ {listing.rentAmount.toLocaleString('bn-BD')} <span className="text-xs font-normal text-slate-200">/মাস</span>
            </div>
            {listing.serviceCharge ? (
              <p className="text-xs text-slate-200 drop-shadow-xs">+ সার্ভিস চার্জ ৳ {listing.serviceCharge.toLocaleString('bn-BD')}</p>
            ) : null}
          </div>
          <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white font-medium">
            {listing.availableFrom}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 
            onClick={() => onSelect(listing)}
            className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 hover:text-emerald-600 cursor-pointer transition-colors"
          >
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-slate-500 text-xs sm:text-sm mt-1.5 mb-3">
            <MapPin className="w-4 h-4 mr-1 text-rose-500 shrink-0" />
            <span className="truncate">{listing.area}, {listing.city}</span>
          </div>

          {/* House Spec Badges */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-slate-700 text-xs sm:text-sm mb-3 font-medium bg-slate-50/50 rounded-xl px-2">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-emerald-600" />
              <span>{listing.bedrooms} বেড</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-emerald-600" />
              <span>{listing.bathrooms} বাথ</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{listing.sizeSqFt} স্কয়ার ফিট</span>
            </div>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 text-xs text-slate-600">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>{gasLabel[listing.gasFacility]}</span>
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
              {listing.floor}
            </span>
            {listing.lift && (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                লিফট আছে
              </span>
            )}
            {listing.parking !== 'none' && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                পার্কিং
              </span>
            )}
            {isFeatured && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center space-x-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>{listing.viewCount && listing.viewCount >= 100 ? 'উচ্চ ভিউ / জনপ্রিয়' : 'প্রিমিয়াম পছন্দ'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            id={`btn-view-${listing.id}`}
            onClick={() => onSelect(listing)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors text-center"
          >
            বিস্তারিত দেখুন
          </button>
          <button
            id={`btn-inquire-${listing.id}`}
            onClick={() => onOpenInquiry(listing)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>ভাড়া নিতে আবেদন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
