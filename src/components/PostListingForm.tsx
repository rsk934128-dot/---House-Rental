import React, { useState } from 'react';
import { HouseRentalListing } from '../types';
import { Camera, MapPin, Plus, Trash2, CheckCircle2, UploadCloud, Info, Sparkles } from 'lucide-react';
import { BANGLADESH_AREAS } from '../data/mockListings';

interface PostListingFormProps {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  currentUserId?: string;
  onSubmitSuccess: (newListing: HouseRentalListing) => void;
  onCancel: () => void;
}

export const PostListingForm: React.FC<PostListingFormProps> = ({
  userEmail,
  userName,
  userPhone,
  currentUserId,
  onSubmitSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'family' | 'bachelor' | 'sublet' | 'office' | 'hostel'>('family');
  const [rentAmount, setRentAmount] = useState<number | ''>('');
  const [serviceCharge, setServiceCharge] = useState<number | ''>('');
  const [advanceDeposit, setAdvanceDeposit] = useState<number | ''>('');
  const [availableFrom, setAvailableFrom] = useState('১লা নভেম্বর ২০২৪');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [balconies, setBalconies] = useState(1);
  const [floor, setFloor] = useState('৪র্থ তলা');
  const [totalFloors, setTotalFloors] = useState('৬ তলা');
  const [sizeSqFt, setSizeSqFt] = useState<number | ''>(1200);

  // Location
  const [city, setCity] = useState('ঢাকা');
  const [area, setArea] = useState('মিরপুর-১০');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(23.8071);
  const [longitude, setLongitude] = useState<number | undefined>(90.3686);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Facilities
  const [gasFacility, setGasFacility] = useState<'line' | 'cylinder' | 'none'>('line');
  const [lift, setLift] = useState(true);
  const [generator, setGenerator] = useState(true);
  const [parking, setParking] = useState<'car' | 'bike' | 'both' | 'none'>('car');
  const [cctv, setCctv] = useState(true);
  const [wifi, setWifi] = useState(true);
  const [securityGuard, setSecurityGuard] = useState(true);

  // Images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Landlord
  const [landlordName, setLandlordName] = useState(userName || '');
  const [landlordPhone, setLandlordPhone] = useState(userPhone || '');
  const [landlordEmail, setLandlordEmail] = useState(userEmail || 'skr491694@gmail.com');
  const [contactTime, setContactTime] = useState('সকাল ৯টা থেকে রাত ৯টা');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationFeedback, setLocationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-detect browser location
  const handleDetectLocation = () => {
    setLocationFeedback(null);
    if (!navigator.geolocation) {
      setLocationFeedback({
        type: 'error',
        message: 'আপনার ব্রাউজারে স্বয়ংক্রিয় লোকেশন সমর্থিত নয়। অনুগ্রহ করে নিচে ঠিকানা লিখে দিন।'
      });
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(5)));
        setLongitude(Number(position.coords.longitude.toFixed(5)));
        setIsDetectingLocation(false);
        setLocationFeedback({
          type: 'success',
          message: 'আপনার বর্তমান অক্ষাংশ ও দ্রাঘিমাংশ সফলভাবে চিহ্নিত করা হয়েছে।'
        });
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsDetectingLocation(false);
        setLocationFeedback({
          type: 'error',
          message: 'লোকেশন স্বয়ংক্রিয়ভাবে পাওয়া যায়নি। অনুগ্রহ করে নিচের ঘরে ঠিকানা লিখে দিন।'
        });
      },
      { timeout: 10000 }
    );
  };

  // Image upload via file input (Camera / gallery)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl) return;
    setImages(prev => [...prev, newImageUrl]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'বিজ্ঞাপনের শিরোনাম আবশ্যক';
    if (!rentAmount) newErrors.rentAmount = 'মাসিক ভাড়ার পরিমাণ দিন';
    if (!fullAddress.trim()) newErrors.fullAddress = 'পূর্ণ ঠিকানা আবশ্যক';
    if (!landlordName.trim()) newErrors.landlordName = 'বাড়িওয়ালার নাম আবশ্যক';
    if (!landlordPhone.trim()) newErrors.landlordPhone = 'যোগাযোগের মোবাইল নম্বর আবশ্যক';
    if (!landlordEmail.trim()) newErrors.landlordEmail = 'ইমেইল এড্রেস আবশ্যক';
    if (images.length === 0) newErrors.images = 'কমপক্ষে একটি বাড়ির ছবি আপলোড করুন';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newListing: HouseRentalListing = {
      id: `house-${Date.now()}`,
      title: title.trim(),
      propertyType,
      rentAmount: Number(rentAmount),
      serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
      advanceDeposit: advanceDeposit ? Number(advanceDeposit) : undefined,
      availableFrom: availableFrom.trim() || 'চলতি মাস থেকেই',
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      balconies: Number(balconies),
      floor: floor.trim() || '৩য় তলা',
      totalFloors: totalFloors.trim() || '৬ তলা',
      sizeSqFt: Number(sizeSqFt) || 1000,
      city,
      area,
      fullAddress: fullAddress.trim(),
      landmark: landmark.trim() || undefined,
      latitude,
      longitude,
      gasFacility,
      lift,
      generator,
      parking,
      cctv,
      wifi,
      securityGuard,
      images,
      landlordName: landlordName.trim(),
      landlordPhone: landlordPhone.trim(),
      landlordEmail: landlordEmail.trim(),
      contactTime: contactTime.trim() || undefined,
      description: description.trim() || 'সুন্দর পরিপাটি বাসা। আলো-বাতাসময় পরিবেশ।',
      createdAt: new Date().toISOString().split('T')[0],
      isAvailable: true,
      verified: true,
      isFeatured: isFeatured,
      landlordUid: currentUserId || undefined
    };

    onSubmitSuccess(newListing);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center space-x-3 text-emerald-200 text-sm font-semibold mb-2">
          <UploadCloud className="w-5 h-5" />
          <span>বাড়িওয়ালাদের জন্য সহজ ফরম</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">আপনার বাসা বাড়ি ভাড়ার বিজ্ঞাপন দিন</h1>
        <p className="text-sm sm:text-base text-emerald-100 mt-2 max-w-2xl">
          ছবি তুলুন, ঠিকানা ও রুমের বিবরণ দিন। আগ্রহী ভাড়াটিয়ারা সরাসরি আপনার সাথে যোগাযোগ এবং অনলাইনে আবেদন করতে পারবে।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Step 1: Basic Info */}
        <section className="space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">১</span>
              <span>বাসার মূল বিবরণ ও ধরণ</span>
            </h2>
            <span className="text-xs text-slate-400">* চিহ্নিত ঘরগুলো বাধ্যতামূলক</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              বিজ্ঞাপনের আকর্ষণীয় শিরোনাম *
            </label>
            <input
              id="input-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: মিরপুর ১০ এ মেট্রোরেলের কাছে ৩ বেডরুমের আলো-বাতাসপূর্ণ ফ্ল্যাট"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">বাসার ধরণ *</label>
              <select
                id="select-property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
              >
                <option value="family">পারিবারিক ফ্ল্যাট (Family)</option>
                <option value="bachelor">ব্যাচেলর মেস/ফ্ল্যাট (Bachelor)</option>
                <option value="sublet">সাবলেট রুম (Sublet)</option>
                <option value="office">অফিস স্পেস (Commercial)</option>
                <option value="hostel">হোস্টেল রুম (Hostel)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">মাসিক ভাড়া (টাকা) *</label>
              <input
                id="input-rent-amount"
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ২২০০০"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm font-mono"
              />
              {errors.rentAmount && <p className="text-rose-500 text-xs mt-1">{errors.rentAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">সার্ভিস চার্জ (ঐচ্ছিক)</label>
              <input
                id="input-service-charge"
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ৩৫০০"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">অগ্রিম জামানত (টাকা)</label>
              <input
                id="input-advance"
                type="number"
                value={advanceDeposit}
                onChange={(e) => setAdvanceDeposit(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ৪৪০০০ (২ মাসের ভাড়া)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">কবে থেকে ভাড়া দেওয়া হবে?</label>
              <input
                id="input-available-from"
                type="text"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                placeholder="যেমন: ১লা নভেম্বর ২০২৪"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">মোট আয়তন (বর্গফুট / Sqft)</label>
              <input
                id="input-size-sqft"
                type="number"
                value={sizeSqFt}
                onChange={(e) => setSizeSqFt(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ১৩৫০"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm font-mono"
              />
            </div>
          </div>

          {/* Rooms count */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">বেডরুম সংখ্যা</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} টি বেডরুম</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">বাথরুম সংখ্যা</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} টি বাথরুম</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">বারান্দা সংখ্যা</label>
              <select
                value={balconies}
                onChange={(e) => setBalconies(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm"
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} টি বারান্দা</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">কত তলা?</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="যেমন: ৪র্থ তলা"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মোট বিল্ডিং তলা</label>
              <input
                type="text"
                value={totalFloors}
                onChange={(e) => setTotalFloors(e.target.value)}
                placeholder="যেমন: ৮ তলা ভবন"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Step 2: Location Information */}
        <section className="space-y-5 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">২</span>
              <span>লোকেশন ও ঠিকানা</span>
            </h2>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors border border-emerald-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isDetectingLocation ? 'শনাক্ত হচ্ছে...' : 'আমার বর্তমান লোকেশন নিন'}</span>
            </button>
          </div>

          {locationFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              locationFeedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {locationFeedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">শহর / বিভাগ *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="ঢাকা">ঢাকা (Dhaka)</option>
                <option value="চট্টগ্রাম">চট্টগ্রাম (Chittagong)</option>
                <option value="সিলেট">সিলেট (Sylhet)</option>
                <option value="রাজশাহী">রাজশাহী (Rajshahi)</option>
                <option value="খুলনা">খুলনা (Khulna)</option>
                <option value="বরিশাল">বরিশাল (Barishal)</option>
                <option value="রংপুর">রংপুর (Rangpur)</option>
                <option value="ময়মনসিংহ">ময়মনসিংহ (Mymensingh)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">এলাকা / জোন *</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
              >
                {BANGLADESH_AREAS.filter(a => a !== 'সব এলাকা').map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">পূর্ণাঙ্গ ঠিকানা (বাড়ি, রোড, ব্লক) *</label>
            <input
              id="input-full-address"
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="যেমন: বাড়ি #৪৫, রোড #৬, ব্লক-সি, মিরপুর-১০, ঢাকা"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
            />
            {errors.fullAddress && <p className="text-rose-500 text-xs mt-1">{errors.fullAddress}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">কাছের ল্যান্ডমার্ক / চেনার সহজ উপায়</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="যেমন: গোল চত্বর ও মেট্রো স্টেশন থেকে ২ মিনিট হাঁটার দূরত্ব"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
            />
          </div>

          {latitude && longitude && (
            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 flex items-center justify-between">
              <span>ম্যাপ কোঅর্ডিনেট: {latitude}, {longitude}</span>
              <span className="text-emerald-600 font-medium">✓ ম্যাপ লোকেশন যুক্ত করা হয়েছে</span>
            </div>
          )}
        </section>

        {/* Step 3: Photos Upload */}
        <section className="space-y-5 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">৩</span>
              <span>বাড়ির ছবি তুলে আপলোড করুন</span>
            </h2>
            <span className="text-xs text-emerald-700 font-semibold">{images.length} টি ছবি যুক্ত আছে</span>
          </div>

          {/* Upload trigger buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File upload / Camera trigger */}
            <label className="cursor-pointer border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:scale-110 text-emerald-700 flex items-center justify-center mb-2 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">ক্যামেরা দিয়ে ছবি তুলুন বা ফাইল বাছুন</span>
              <span className="text-xs text-slate-500 mt-1">ক্লিক করে ড্রাইভ, মোবাইল গ্যালারি বা সরাসরি ফটো তুলুন</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* URL input */}
            <div className="border border-slate-200 p-5 rounded-2xl flex flex-col justify-center space-y-2">
              <span className="text-xs font-semibold text-slate-700">অনলাইন ছবির লিংক যোগ করুন (ঐচ্ছিক)</span>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>যোগ</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">ড্রপবক্স, গুগল ড্রাইভ বা ইমেজ হোস্ট লিংক দিতে পারেন</p>
            </div>
          </div>

          {errors.images && <p className="text-rose-500 text-xs">{errors.images}</p>}

          {/* Images Grid preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200">
                  <img src={imgUrl} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    title="ছবি মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      প্রধান কভার
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 4: Facilities & Amenities */}
        <section className="space-y-5 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">৪</span>
              <span>গ্যাস, পার্কিং ও সুযোগ-সুবিধা</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">গ্যাস সুবিধা</label>
              <select
                value={gasFacility}
                onChange={(e) => setGasFacility(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="line">সরকারি লাইন গ্যাস (সার্বক্ষণিক)</option>
                <option value="cylinder">সিলিন্ডার গ্যাস সুবিধা</option>
                <option value="none">গ্যাস সংযোগ নেই</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">পার্কিং সুবিধা</label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="car">গাড়ি পার্কিং (Car Parking)</option>
                <option value="bike">বাইক পার্কিং (Bike Parking)</option>
                <option value="both">গাড়ি ও বাইক উভয় পার্কিং</option>
                <option value="none">পার্কিং সুবিধা নেই</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={lift}
                onChange={(e) => setLift(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">লিফট (Lift)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={generator}
                onChange={(e) => setGenerator(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">জেনারেটর ব্যাকআপ</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={securityGuard}
                onChange={(e) => setSecurityGuard(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">সিকিউরিটি গার্ড</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={cctv}
                onChange={(e) => setCctv(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">সিসিটিভি ক্যামেরা</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={wifi}
                onChange={(e) => setWifi(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">ইন্টারনেট / ওয়াইফাই</span>
            </label>
          </div>
        </section>

        {/* Step 5: Description & Landlord Contact Details */}
        <section className="space-y-5 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">৫</span>
              <span>বাড়িওয়ালার যোগাযোগ ও অন্যান্য বিবরণ</span>
            </h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">বাসার বিস্তারিত বর্ণনা</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বাসাটির আশপাশের সুবিধা, কিচেন, বাথরুম টাইলস, নিরাপত্তা ও শর্তাবলী ইত্যাদি সম্পর্কে বিস্তারিত লিখুন..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">বাড়িওয়ালার নাম *</label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                placeholder="যেমন: মুহাম্মদ রফিকুল ইসলাম"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
              />
              {errors.landlordName && <p className="text-rose-500 text-xs mt-1">{errors.landlordName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">মোবাইল নম্বর *</label>
              <input
                type="tel"
                value={landlordPhone}
                onChange={(e) => setLandlordPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm font-mono"
              />
              {errors.landlordPhone && <p className="text-rose-500 text-xs mt-1">{errors.landlordPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">ইমেইল (Gmail) *</label>
              <input
                type="email"
                value={landlordEmail}
                onChange={(e) => setLandlordEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
              />
              {errors.landlordEmail && <p className="text-rose-500 text-xs mt-1">{errors.landlordEmail}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">যোগাযোগের উপযুক্ত সময়</label>
            <input
              type="text"
              value={contactTime}
              onChange={(e) => setContactTime(e.target.value)}
              placeholder="যেমন: সকাল ৯টা থেকে রাত ৯টা"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
            />
          </div>

          {/* Premium Featured Listing Option */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start space-x-3.5">
            <input
              type="checkbox"
              id="input-is-featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="input-is-featured" className="cursor-pointer">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
                <span>ফিচার্ড লিস্টিং হিসেবে মার্ক করুন (Mark as Featured)</span>
              </span>
              <p className="text-xs text-amber-800/90 mt-1">
                লিস্টিংটিতে সোনালী 'ফিচার্ড' ব্যাজ প্রদর্শিত হবে এবং সার্চ ও ফিল্টারে অগ্রাধিকার পেয়ে বেশি মানুষের নজরে আসবে।
              </p>
            </label>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            বাতিল করুন
          </button>

          <button
            id="btn-submit-listing"
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>বিজ্ঞাপনটি প্রকাশ করুন (Publish Listing)</span>
          </button>
        </div>

      </form>
    </div>
  );
};
