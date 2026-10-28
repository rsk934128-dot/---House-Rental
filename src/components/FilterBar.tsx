import React from 'react';
import { FilterState } from '../types';
import { Search, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { BANGLADESH_AREAS } from '../data/mockListings';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalResults
}) => {
  const handleReset = () => {
    setFilters({
      searchQuery: '',
      area: 'সব এলাকা',
      propertyType: 'all',
      minRent: 0,
      maxRent: 150000,
      bedrooms: 'all',
      gasFacility: 'all',
      hasLift: false,
      hasParking: false,
      sortBy: 'latest',
      featuredOnly: false
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-8 space-y-4">
      {/* Search Input and Top Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search by title / landmark / keyword */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            id="search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="এলাকা, রাস্তার নাম, ল্যান্ডমার্ক বা বাসার শিরোনাম দিয়ে খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden text-sm bg-slate-50/50"
          />
        </div>

        {/* Area dropdown */}
        <div className="w-full md:w-56">
          <select
            id="filter-area"
            value={filters.area}
            onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700 outline-hidden"
          >
            {BANGLADESH_AREAS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="w-full md:w-48">
          <select
            id="filter-property-type"
            value={filters.propertyType}
            onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700 outline-hidden"
          >
            <option value="all">সব ধরণ (All Types)</option>
            <option value="family">পারিবারিক (Family)</option>
            <option value="bachelor">ব্যাচেলর (Bachelor)</option>
            <option value="sublet">সাবলেট (Sublet)</option>
            <option value="office">অফিস (Commercial)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="w-full md:w-48">
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700 outline-hidden"
          >
            <option value="latest">নতুন যুক্ত হওয়া</option>
            <option value="featured">✨ ফিচার্ড ও জনপ্রিয় প্রথমে</option>
            <option value="rent_low_to_high">ভাড়া: কম থেকে বেশি</option>
            <option value="rent_high_to_low">ভাড়া: বেশি থেকে কম</option>
          </select>
        </div>
      </div>

      {/* Secondary filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ফিল্টার:</span>
          </span>

          {/* Featured Only Filter Chip */}
          <button
            type="button"
            id="btn-filter-featured"
            onClick={() => setFilters(prev => ({ ...prev, featuredOnly: !prev.featuredOnly }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-all ${
              filters.featuredOnly
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-xs'
                : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${filters.featuredOnly ? 'text-white' : 'text-amber-600'}`} />
            <span>{filters.featuredOnly ? '✓ শুধু ফিচার্ড' : '+ শুধু ফিচার্ড'}</span>
          </button>

          {/* Bedrooms chip */}
          <select
            value={filters.bedrooms}
            onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="all">সব রুম সংখ্যা</option>
            <option value="1">১ বেডরুম</option>
            <option value="2">২ বেডরুম</option>
            <option value="3">৩ বেডরুম</option>
            <option value="4+">৪+ বেডরুম</option>
          </select>

          {/* Gas chip */}
          <select
            value={filters.gasFacility}
            onChange={(e) => setFilters(prev => ({ ...prev, gasFacility: e.target.value }))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="all">গ্যাস: যেকোনো</option>
            <option value="line">লাইন গ্যাস</option>
            <option value="cylinder">সিলিন্ডার</option>
          </select>

          {/* Lift */}
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, hasLift: !prev.hasLift }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              filters.hasLift
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filters.hasLift ? '✓ লিফট সহ' : '+ লিফট'}
          </button>

          {/* Parking */}
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, hasParking: !prev.hasParking }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              filters.hasParking
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filters.hasParking ? '✓ পার্কিং সহ' : '+ পার্কিং'}
          </button>
        </div>

        {/* Results count & reset */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-600">
            মোট <strong className="text-slate-900 font-mono text-sm">{totalResults}</strong> টি বাসা পাওয়া গেছে
          </span>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-700 flex items-center space-x-1 transition-colors"
            title="সব ফিল্টার রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>

      </div>
    </div>
  );
};
