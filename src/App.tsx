import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { HouseRentalListing, RentalInquiry, FilterState, UserProfile } from './types';
import { INITIAL_HOUSES } from './data/mockListings';
import { initAuth } from './services/auth';
import { testFirestoreConnection } from './services/firebase';
import { 
  subscribeToListings, 
  saveListingToFirestore, 
  deleteListingFromFirestore,
  subscribeToInquiries,
  saveInquiryToFirestore,
  updateInquiryStatusInFirestore,
  getListingsFromFirestore,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  subscribeToUserProfile,
  incrementListingViewCount
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { HouseCard, isFeaturedListing } from './components/HouseCard';
import { HouseDetailModal } from './components/HouseDetailModal';
import { PostListingForm } from './components/PostListingForm';
import { InquiryModal } from './components/InquiryModal';
import { InquiriesView } from './components/InquiriesView';
import { ProfileModal } from './components/ProfileModal';
import { LandlordAnalyticsView } from './components/LandlordAnalyticsView';
import { MultiAccountModal } from './components/MultiAccountModal';
import { GoogleContactsModal } from './components/GoogleContactsModal';
import { BottomNav } from './components/BottomNav';
import { MobileInstallBanner } from './components/MobileInstallBanner';
import { ApkReleaseGuideModal } from './components/ApkReleaseGuideModal';
import { 
  PlusCircle, Sparkles, MapPin, CheckCircle2, ShieldCheck, 
  Home, Camera, PhoneCall, Trash2, Edit3, User as UserIcon, Settings, BarChart2, Eye
} from 'lucide-react';

const LOCAL_STORAGE_LISTINGS_KEY = 'bd_house_rental_listings_v1';
const LOCAL_STORAGE_INQUIRIES_KEY = 'bd_house_rental_inquiries_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'post' | 'my-listings' | 'inquiries' | 'analytics'>('browse');

  // Listings state (starts with INITIAL_HOUSES merged with localStorage)
  const [listings, setListings] = useState<HouseRentalListing[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load listings from storage:', e);
    }
    return INITIAL_HOUSES;
  });

  // Inquiries state
  const [inquiries, setInquiries] = useState<RentalInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load inquiries from storage:', e);
    }
    return [
      {
        id: 'inq-initial-1',
        listingId: 'house-1',
        listingTitle: 'মিরপুর ১০ এ মনোরম পরিবেশে ৩ বেডরুমের আলো-বাতাসপূর্ণ ফ্ল্যাট',
        tenantName: 'তানভীর আহমেদ',
        tenantPhone: '01799887766',
        tenantEmail: 'tanvir.tenant@gmail.com',
        familyMembers: 4,
        profession: 'সফটওয়্যার ইঞ্জিনিয়ার',
        proposedMoveInDate: '১লা নভেম্বর ২০২৪',
        message: 'আমরা ৪ জনের ছোট পরিবার। পরিবারসহ বাড়িটি দেখতে চাই। শুক্রবার কি দেখা সম্ভব?',
        status: 'pending',
        createdAt: new Date().toISOString(),
        sentViaGmail: true
      }
    ];
  });

  // Modals state
  const [selectedListing, setSelectedListing] = useState<HouseRentalListing | null>(null);
  const [inquiryListing, setInquiryListing] = useState<HouseRentalListing | null>(null);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isMultiAccountModalOpen, setIsMultiAccountModalOpen] = useState<boolean>(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState<boolean>(false);
  const [isApkGuideModalOpen, setIsApkGuideModalOpen] = useState<boolean>(false);
  const [contactToSave, setContactToSave] = useState<{
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    organization?: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(listings));
    } catch (e) {
      console.warn('Failed to save listings to localStorage:', e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.warn('Failed to save inquiries to localStorage:', e);
    }
  }, [inquiries]);

  // Firebase Firestore connection & realtime listeners
  useEffect(() => {
    testFirestoreConnection();

    // Subscribe to realtime listings from Firestore
    const unsubListings = subscribeToListings((remoteListings) => {
      if (remoteListings && remoteListings.length > 0) {
        setListings(remoteListings);
      }
    });

    // Subscribe to realtime inquiries from Firestore
    const unsubInquiries = subscribeToInquiries((remoteInquiries) => {
      if (remoteInquiries) {
        setInquiries(remoteInquiries);
      }
    });

    return () => {
      if (typeof unsubListings === 'function') unsubListings();
      if (typeof unsubInquiries === 'function') unsubInquiries();
    };
  }, []);

  // Firebase auth initialization & UserProfile sync
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        if (user) {
          // Subscribe to user profile or create initial record if not exists
          unsubProfile = subscribeToUserProfile(user.uid, (existingProfile) => {
            if (existingProfile) {
              setUserProfile(existingProfile);
            } else {
              // Create default profile document
              const initialProfile: UserProfile = {
                uid: user.uid,
                displayName: user.displayName || 'সম্মানিত ব্যবহারকারী',
                email: user.email || '',
                role: 'both',
                notificationEmail: true,
                verifiedIdentity: false,
                joinedAt: new Date().toISOString().split('T')[0]
              };
              saveUserProfileToFirestore(initialProfile).catch((err) => {
                console.warn('Initial profile creation note:', err);
              });
              setUserProfile(initialProfile);
            }
          });
        } else {
          setUserProfile(null);
        }
      },
      () => {
        setCurrentUser(null);
        setUserProfile(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubProfile === 'function') unsubProfile();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add new listing handler
  const handleAddNewListing = async (newListing: HouseRentalListing) => {
    setListings(prev => [newListing, ...prev]);
    setActiveTab('browse');
    showToast('আপনার বাসা ভাড়ার বিজ্ঞাপনটি সফলভাবে প্রকাশিত হয়েছে!');
    try {
      await saveListingToFirestore(newListing);
    } catch (e) {
      console.warn('Listing saved locally, syncing to cloud:', e);
    }
  };

  // Delete listing handler
  const confirmDeleteListing = async () => {
    if (listingToDelete) {
      const targetId = listingToDelete;
      setListings(prev => prev.filter(item => item.id !== targetId));
      setListingToDelete(null);
      showToast('বিজ্ঞাপনটি সফলভাবে মুছে ফেলা হয়েছে।');
      try {
        await deleteListingFromFirestore(targetId);
      } catch (e) {
        console.warn('Listing deleted locally, syncing cloud:', e);
      }
    }
  };

  // Add new inquiry handler
  const handleNewInquiry = async (inquiry: RentalInquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
    setInquiryListing(null);
    showToast(
      inquiry.sentViaGmail
        ? 'আপনার আবেদন জমা হয়েছে এবং বাড়িওয়ালার Gmail এ নোটিফিকেশন পৌঁছে গেছে!'
        : 'আপনার আবেদন সফলভাবে বাড়িওয়ালার কাছে জমা হয়েছে!'
    );
    try {
      await saveInquiryToFirestore(inquiry);
    } catch (e) {
      console.warn('Inquiry saved locally, syncing cloud:', e);
    }
  };

  // Update inquiry status
  const handleUpdateInquiryStatus = async (id: string, newStatus: 'pending' | 'contacted' | 'booked' | 'rejected') => {
    setInquiries(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    showToast('আবেদনের স্ট্যাটাস হালনাগাদ করা হয়েছে।');
    try {
      await updateInquiryStatusInFirestore(id, newStatus);
    } catch (e) {
      console.warn('Inquiry status updated locally, syncing cloud:', e);
    }
  };

  // Select listing with automatic view count increment
  const handleSelectListing = async (listing: HouseRentalListing) => {
    // Increment viewCount locally immediately
    const updatedCount = (listing.viewCount || 0) + 1;
    const updatedListing = { ...listing, viewCount: updatedCount };
    
    // Update selected listing in modal
    setSelectedListing(updatedListing);

    // Update in listings array
    setListings(prev =>
      prev.map(l => (l.id === listing.id ? { ...l, viewCount: updatedCount } : l))
    );

    // Trigger atomic Firestore increment
    try {
      await incrementListingViewCount(listing.id);
    } catch (e) {
      console.warn('View count incremented locally, Firestore sync note:', e);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    try {
      await saveUserProfileToFirestore(updatedProfile);
      showToast('প্রোফাইল সফলভাবে ক্লাউড ডাটাবেসে হালনাগাদ হয়েছে!');
    } catch (e) {
      console.warn('Profile save note:', e);
      showToast('প্রোফাইল তথ্য সংরক্ষিত হয়েছে।');
    }
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesArea = item.area.toLowerCase().includes(q);
        const matchesAddress = item.fullAddress.toLowerCase().includes(q);
        const matchesLandmark = item.landmark?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesArea && !matchesAddress && !matchesLandmark) {
          return false;
        }
      }

      // Area filter
      if (filters.area !== 'সব এলাকা' && item.area !== filters.area) {
        return false;
      }

      // Property type
      if (filters.propertyType !== 'all' && item.propertyType !== filters.propertyType) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'all') {
        if (filters.bedrooms === '4+' && item.bedrooms < 4) return false;
        if (filters.bedrooms !== '4+' && item.bedrooms !== Number(filters.bedrooms)) return false;
      }

      // Gas facility
      if (filters.gasFacility !== 'all' && item.gasFacility !== filters.gasFacility) {
        return false;
      }

      // Lift
      if (filters.hasLift && !item.lift) {
        return false;
      }

      // Parking
      if (filters.hasParking && item.parking === 'none') {
        return false;
      }

      // Featured only
      if (filters.featuredOnly && !isFeaturedListing(item)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'featured') {
        const aFeatured = isFeaturedListing(a);
        const bFeatured = isFeaturedListing(b);
        if (aFeatured !== bFeatured) {
          return aFeatured ? -1 : 1;
        }
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (filters.sortBy === 'rent_low_to_high') {
        return a.rentAmount - b.rentAmount;
      }
      if (filters.sortBy === 'rent_high_to_low') {
        return b.rentAmount - a.rentAmount;
      }
      // 'latest' default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, filters]);

  // My listings (filtered by user email if logged in, or recently created)
  const myListings = useMemo(() => {
    if (currentUser?.email) {
      return listings.filter(
        l => l.landlordEmail.toLowerCase() === currentUser.email?.toLowerCase()
      );
    }
    // Fallback: show first 2 or created
    return listings.slice(0, 2);
  }, [listings, currentUser]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Mobile & PWA Install Banner */}
      <MobileInstallBanner onOpenApkGuide={() => setIsApkGuideModalOpen(true)} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myListingsCount={myListings.length}
        inquiriesCount={inquiries.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenMultiAccount={() => setIsMultiAccountModalOpen(true)}
        onOpenContacts={() => {
          setContactToSave(null);
          setIsContactsModalOpen(true);
        }}
        onOpenApkGuide={() => setIsApkGuideModalOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-center space-x-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container with Mobile Bottom Nav Padding */}
      <main className="flex-1 pb-20 md:pb-6">
        
        {/* VIEW 1: Browse Houses */}
        {activeTab === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-12 mb-8 shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>বাড়িওয়ালা ও ভাড়াটিয়াদের নির্ভরযোগ্য প্ল্যাটফর্ম</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  পছন্দের বাসা বাড়ি খুঁজুন ও সরাসরি ভাড়া নিন
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  বাড়িওয়ালারা তাদের ফ্ল্যাট বা রুমের ছবি তুলে লোকেশনসহ আপলোড করতে পারেন। ভাড়াটিয়ারা সরাসরি ছবি ও বিস্তারিত দেখে বুকিং আবেদন পাঠাতে পারবেন।
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('post')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>বাড়ি ভাড়ার বিজ্ঞাপন দিন</span>
                  </button>
                  <a
                    href="#browse-list"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center space-x-2"
                  >
                    <Home className="w-4 h-4 text-emerald-400" />
                    <span>উপলব্ধ বাসাগুলো দেখুন</span>
                  </a>
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            </div>

            {/* Filter and Search Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalResults={filteredListings.length}
            />

            {/* House Listings Grid */}
            <div id="browse-list">
              {filteredListings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6">
                  <Home className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">কোন বাসা পাওয়া যায়নি</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    আপনার নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো বাড়ি পাওয়া যায়নি। অন্য এলাকা বা ফিল্টার রিসেট করে চেষ্টা করুন।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <HouseCard
                      key={listing.id}
                      listing={listing}
                      onSelect={(l) => handleSelectListing(l)}
                      onOpenInquiry={(l) => setInquiryListing(l)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: Landlord Post Listing Form */}
        {activeTab === 'post' && (
          <PostListingForm
            userEmail={currentUser?.email || undefined}
            userName={userProfile?.displayName || currentUser?.displayName || undefined}
            userPhone={userProfile?.phone || undefined}
            currentUserId={currentUser?.uid || undefined}
            onSubmitSuccess={handleAddNewListing}
            onCancel={() => setActiveTab('browse')}
          />
        )}

        {/* VIEW 3: My Listings (বাড়িওয়ালার নিজস্ব বিজ্ঞাপন) */}
        {activeTab === 'my-listings' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* User Profile Quick Banner */}
            {currentUser && (
              <div className="mb-6 bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5 text-left w-full sm:w-auto">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-12 h-12 rounded-2xl ring-2 ring-emerald-400/50 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center font-bold text-white text-lg">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center space-x-2">
                      <span>{userProfile?.displayName || currentUser.displayName}</span>
                      <span className="text-[11px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                        {userProfile?.role === 'landlord' ? 'বাড়িওয়ালা' : userProfile?.role === 'tenant' ? 'ভাড়াটিয়া' : 'বাড়িওয়ালা ও ভাড়াটিয়া'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {userProfile?.phone ? `মোবাইল: ${userProfile.phone}` : currentUser.email}
                      {userProfile?.preferredCity && ` • ${userProfile.preferredCity}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-white/15"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>প্রোফাইল কন্ট্রোল ও সেটিংস</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">আমার প্রকাশিত বিজ্ঞাপনসমূহ</h1>
                <p className="text-sm text-slate-500">আপনার দ্বারা পোস্ট করা বাসা বাড়ি ভাড়ার তালিকা</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>ভিউ অ্যানালিটিক্স দেখুন</span>
                </button>
                <button
                  onClick={() => setActiveTab('post')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>নতুন বাসা যুক্ত করুন</span>
                </button>
              </div>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">এখনো কোনো বিজ্ঞাপন দেননি</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  আপনার বাড়ি বা ফ্ল্যাট ভাড়া দিতে এখনই ছবি তুলে সম্পূর্ণ তথ্য দিয়ে বিজ্ঞাপন প্রকাশ করুন।
                </p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  বিজ্ঞাপন দিন
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            {item.propertyType}
                          </span>
                          <span className="text-xs text-slate-400">
                            পোস্ট: {item.createdAt}
                          </span>
                          {item.viewCount !== undefined && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>{item.viewCount} ভিউ</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate mt-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
                          <span className="truncate">{item.fullAddress}</span>
                        </p>
                        <p className="text-xs font-bold text-emerald-700 mt-1">
                          ৳ {item.rentAmount.toLocaleString('bn-BD')} /মাস • {item.bedrooms} বেড • {item.sizeSqFt} স্কয়ারফিট
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                      >
                        প্রিভিউ
                      </button>
                      <button
                        id={`btn-delete-${item.id}`}
                        onClick={() => setListingToDelete(item.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-100"
                        title="বিজ্ঞাপন মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: Inquiries View */}
        {activeTab === 'inquiries' && (
          <InquiriesView
            inquiries={inquiries}
            onUpdateStatus={handleUpdateInquiryStatus}
            onSaveToContacts={(inq) => {
              setContactToSave({
                name: inq.tenantName,
                phone: inq.tenantPhone,
                email: inq.tenantEmail,
                notes: `ভাড়াটিয়া আবেদনকারী - বাসা: ${inq.listingTitle}`,
                organization: 'বাসা বাড়ি ভাড়া'
              });
              setIsContactsModalOpen(true);
            }}
          />
        )}

        {/* VIEW 5: Landlord Analytics View */}
        {activeTab === 'analytics' && (
          <LandlordAnalyticsView
            myListings={myListings}
            inquiries={inquiries}
            onSelectListing={(l) => handleSelectListing(l)}
            onNavigateToPost={() => setActiveTab('post')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-semibold text-slate-800">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>বাসা বাড়ি ভাড়া ম্যানেজমেন্ট প্ল্যাটফর্ম</span>
          </div>
          <p>© {new Date().getFullYear()} সকল স্বত্ব সংরক্ষিত। বাড়িওয়ালা ও ভাড়াটিয়াদের জন্য সরাসরি সংযোগ মাধ্যম।</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>ক্যামেরা ছবি আপলোড</span>
            <span>•</span>
            <span>Google Maps লোকেশন</span>
            <span>•</span>
            <span>Gmail নোটিফিকেশন</span>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">বিজ্ঞাপন মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              আপনি কি নিশ্চিত যে এই বাসা ভাড়ার বিজ্ঞাপনটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলতে চান? এটি আর পুনরায় ফিরে পাওয়া যাবে না।
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDeleteListing}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* House Detail Modal */}
      {selectedListing && (
        <HouseDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpenInquiry={(l) => {
            setSelectedListing(null);
            setInquiryListing(l);
          }}
          onSaveLandlordToContacts={(contact) => {
            setContactToSave(contact);
            setIsContactsModalOpen(true);
          }}
        />
      )}

      {/* Rental Inquiry Modal */}
      {inquiryListing && (
        <InquiryModal
          listing={inquiryListing}
          currentUser={currentUser}
          userPhone={userProfile?.phone}
          onClose={() => setInquiryListing(null)}
          onSubmitSuccess={handleNewInquiry}
        />
      )}

      {/* User Profile & Account Control Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          profile={userProfile}
          onSaveProfile={handleSaveProfile}
          userListingsCount={myListings.length}
          userInquiriesCount={inquiries.length}
          totalViewsCount={myListings.reduce((sum, item) => sum + (item.viewCount || 0), 0)}
          onNavigateToMyListings={() => setActiveTab('my-listings')}
          onNavigateToInquiries={() => setActiveTab('inquiries')}
          onNavigateToAnalytics={() => setActiveTab('analytics')}
          onOpenMultiAccount={() => setIsMultiAccountModalOpen(true)}
          onOpenContacts={() => {
            setContactToSave(null);
            setIsContactsModalOpen(true);
          }}
          onOpenApkGuide={() => setIsApkGuideModalOpen(true)}
        />
      )}

      {/* Multi-Account Google Login & Switcher Modal */}
      <MultiAccountModal
        isOpen={isMultiAccountModalOpen}
        currentUser={currentUser}
        userProfile={userProfile}
        onClose={() => setIsMultiAccountModalOpen(false)}
        onAccountSwitched={() => {
          showToast('গুগল অ্যাকাউন্ট সফলভাবে পরিবর্তন করা হয়েছে!');
        }}
      />

      {/* Google Contacts (People API) Modal */}
      <GoogleContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => {
          setIsContactsModalOpen(false);
          setContactToSave(null);
        }}
        currentUser={currentUser}
        initialAddContact={contactToSave}
      />

      {/* GitHub Android APK Release Guide Modal */}
      <ApkReleaseGuideModal
        isOpen={isApkGuideModalOpen}
        onClose={() => setIsApkGuideModalOpen(false)}
      />

      {/* Mobile-Only Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inquiriesCount={inquiries.length}
        myListingsCount={myListings.length}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenContacts={() => {
          setContactToSave(null);
          setIsContactsModalOpen(true);
        }}
      />

    </div>
  );
}
