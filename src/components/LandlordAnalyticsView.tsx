import React, { useState } from 'react';
import { HouseRentalListing, RentalInquiry } from '../types';
import { 
  Eye, TrendingUp, Users, Building, ArrowUpRight, 
  Calendar, CheckCircle2, ChevronRight, BarChart2,
  Sparkles, Filter, ShieldCheck, MapPin
} from 'lucide-react';
import { isFeaturedListing } from './HouseCard';

interface LandlordAnalyticsViewProps {
  myListings: HouseRentalListing[];
  inquiries: RentalInquiry[];
  onSelectListing: (listing: HouseRentalListing) => void;
  onNavigateToPost: () => void;
}

export const LandlordAnalyticsView: React.FC<LandlordAnalyticsViewProps> = ({
  myListings,
  inquiries,
  onSelectListing,
  onNavigateToPost
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedListingId, setSelectedListingId] = useState<string>('all');

  // Compute aggregate stats
  const totalListings = myListings.length;
  const totalViews = myListings.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalInquiriesForMyListings = inquiries.filter(inq => 
    myListings.some(item => item.id === inq.listingId)
  ).length;

  // Conversion rate (inquiries / views)
  const conversionRate = totalViews > 0 
    ? ((totalInquiriesForMyListings / totalViews) * 100).toFixed(1)
    : '0.0';

  // Find top viewed listing
  const topViewedListing = myListings.length > 0 
    ? [...myListings].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0]
    : null;

  // Filtered listings based on dropdown
  const displayedListings = selectedListingId === 'all'
    ? [...myListings].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    : myListings.filter(l => l.id === selectedListingId);

  // Maximum view count for scaling bars
  const maxViews = Math.max(...myListings.map(l => l.viewCount || 0), 10);

  // Mock daily traffic trend for visual chart
  const recentDays = [
    { day: 'শনিবার', date: '২১ অক্টো', factor: 0.12 },
    { day: 'রবিবার', date: '২২ অক্টো', factor: 0.18 },
    { day: 'সোমবার', date: '২৩ অক্টো', factor: 0.22 },
    { day: 'মঙ্গলবার', date: '২৪ অক্টো', factor: 0.20 },
    { day: 'বুধবার', date: '২৫ অক্টো', factor: 0.28 },
  ];

  return (
    <div id="landlord-analytics-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
            <span>বাড়িওয়ালা অ্যানালিটিক্স ও ভিউ রিপোর্ট</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            আপনার বাসা ভাড়ার বিজ্ঞাপনগুলো কতজন মানুষ দেখেছেন ও সাড়া দিয়েছেন তার বিস্তারিত পরিসংখ্যান
          </p>
        </div>

        {/* Filter / Actions */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilterPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPeriod === '7d' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => setFilterPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPeriod === '30d' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              গত ৩০ দিন
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPeriod === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              সর্বমোট
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Views */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">মোট ভিউয়ার্স (Views)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalViews.toLocaleString('bn-BD')}
            </div>
            <div className="flex items-center text-emerald-600 text-xs font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+১২.৪% বৃদ্ধি পেয়েছে</span>
            </div>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">ভাড়া আবেদন (Inquiries)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalInquiriesForMyListings.toLocaleString('bn-BD')}
            </div>
            <p className="text-xs text-slate-500 mt-1">সরাসরি আগ্রহী ভাড়াটিয়ার বার্তা</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">আগ্রহের হার (Conversion)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {conversionRate}%
            </div>
            <p className="text-xs text-slate-500 mt-1">ভিউ থেকে আবেদন করার অনুপাত</p>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">সক্রিয় বিজ্ঞাপন</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalListings.toLocaleString('bn-BD')}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">লাইভ তালিকাভুক্ত বাসা</p>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      {myListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">কোনো বিজ্ঞাপনের ভিউ ডেটা নেই</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            আপনার কোনো সক্রিয় বিজ্ঞাপন নেই। বিজ্ঞাপন প্রকাশ করলে এখানে মানুষের আগ্রহ ও ভিউ সংখ্যা দেখা যাবে।
          </p>
          <button
            onClick={onNavigateToPost}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            বিজ্ঞাপন দিন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Individual Listing Views Breakdown Table & Bar */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-slate-900">বিজ্ঞাপন অনুযায়ী ভিউ সংখ্যা (View Count)</h3>
                <p className="text-xs text-slate-500">কোন বাসায় সবচেয়ে বেশি মানুষ নজর দিচ্ছেন</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {myListings.length} টি বিজ্ঞাপন
              </span>
            </div>

            <div className="space-y-4">
              {displayedListings.map((item) => {
                const count = item.viewCount || 0;
                const percentage = Math.round((count / maxViews) * 100);
                const listingInquiries = inquiries.filter(inq => inq.listingId === item.id).length;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                    onClick={() => onSelectListing(item)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 truncate">
                            {isFeaturedListing(item) && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md flex items-center space-x-0.5 border border-amber-300 shrink-0">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                                <span>ফিচার্ড</span>
                              </span>
                            )}
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-emerald-700">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-rose-500 mr-1 shrink-0" />
                            <span>{item.area}, {item.city}</span>
                            <span className="mx-1.5">•</span>
                            <span>৳ {item.rentAmount.toLocaleString('bn-BD')}/মাস</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-end space-x-1">
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>{count.toLocaleString('bn-BD')}</span>
                          <span className="text-xs font-normal text-slate-500 hidden sm:inline">বার দেখা হয়েছে</span>
                        </div>
                        <span className="text-[11px] text-blue-600 font-medium">
                          {listingInquiries} টি আবেদন
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500 group-hover:bg-emerald-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Top Performing & Analytics Insights */}
          <div className="space-y-4">
            
            {/* Top Viewed Listing Card */}
            {topViewedListing && (
              <div className="bg-gradient-to-br from-emerald-800 to-slate-900 text-white rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider bg-emerald-400/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>সর্বাধিক দেখা হয়েছে</span>
                  </span>
                  <span className="text-xs text-slate-300 font-mono">Top #1</span>
                </div>

                <h4 className="font-bold text-sm text-white line-clamp-2 mb-2">
                  {topViewedListing.title}
                </h4>

                <div className="flex items-center space-x-4 py-3 border-y border-white/10 text-xs text-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">মোট ভিউ</span>
                    <span className="text-lg font-black text-white">
                      {(topViewedListing.viewCount || 0).toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">মাসিক ভাড়া</span>
                    <span className="text-lg font-bold text-white">
                      ৳ {topViewedListing.rentAmount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectListing(topViewedListing)}
                  className="mt-4 w-full py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <span>বিজ্ঞাপনটি দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Smart Landlord Tips */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ভিউ ও আবেদন বাড়ানোর টিপস</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>কমপক্ষে ৪টি পরিষ্কার ও আলো ঝলমলে ছবি যোগ করলে ভিউ ৬০% বৃদ্ধি পায়।</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সঠিক ও মানসম্মত মাসিক ভাড়া ও গ্যাস সুবিধার বিস্তারিত উল্লেখ রাখুন।</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>আবেদনকারীদের দ্রুত সাড়া দিলে বাড়ি দ্রুত ভাড়া হয়।</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
