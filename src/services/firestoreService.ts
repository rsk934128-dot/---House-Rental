import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { HouseRentalListing, RentalInquiry, UserProfile } from '../types';
import { INITIAL_HOUSES } from '../data/mockListings';

const LISTINGS_COLLECTION = 'listings';
const INQUIRIES_COLLECTION = 'inquiries';
const USERS_COLLECTION = 'users';

/**
 * Fetch all listings from Firestore. If Firestore is empty, seed with initial mock listings.
 */
export async function getListingsFromFirestore(): Promise<HouseRentalListing[]> {
  try {
    const querySnapshot = await getDocs(collection(db, LISTINGS_COLLECTION));
    if (querySnapshot.empty) {
      // Seed initial listings so users immediately see demo data
      for (const house of INITIAL_HOUSES) {
        await setDoc(doc(db, LISTINGS_COLLECTION, house.id), house);
      }
      return INITIAL_HOUSES;
    }
    const listings: HouseRentalListing[] = [];
    querySnapshot.forEach(docSnap => {
      listings.push(docSnap.data() as HouseRentalListing);
    });
    // Sort latest first
    return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, LISTINGS_COLLECTION);
    return INITIAL_HOUSES;
  }
}

/**
 * Subscribe to realtime listings updates from Firestore
 */
export function subscribeToListings(callback: (listings: HouseRentalListing[]) => void) {
  const listingsCol = collection(db, LISTINGS_COLLECTION);
  return onSnapshot(
    listingsCol,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_HOUSES);
        return;
      }
      const items: HouseRentalListing[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as HouseRentalListing);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, LISTINGS_COLLECTION);
    }
  );
}

/**
 * Save new or updated rental listing to Firestore
 */
export async function saveListingToFirestore(listing: HouseRentalListing): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
  try {
    await setDoc(docRef, listing);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${LISTINGS_COLLECTION}/${listing.id}`);
  }
}

/**
 * Increment the view count for a specific listing
 */
export async function incrementListingViewCount(listingId: string): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  try {
    await updateDoc(docRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    // Graceful fallback if document needs setDoc or offline
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentCount = snap.data().viewCount || 0;
        await updateDoc(docRef, { viewCount: currentCount + 1 });
      }
    } catch (e) {
      console.warn(`Could not increment view count for ${listingId}:`, e);
    }
  }
}

/**
 * Delete a listing from Firestore
 */
export async function deleteListingFromFirestore(listingId: string): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${LISTINGS_COLLECTION}/${listingId}`);
  }
}

/**
 * Subscribe to realtime rental inquiries
 */
export function subscribeToInquiries(callback: (inquiries: RentalInquiry[]) => void) {
  const inquiriesCol = collection(db, INQUIRIES_COLLECTION);
  return onSnapshot(
    inquiriesCol,
    (snapshot) => {
      const items: RentalInquiry[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as RentalInquiry);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, INQUIRIES_COLLECTION);
    }
  );
}

/**
 * Save a new tenant inquiry to Firestore
 */
export async function saveInquiryToFirestore(inquiry: RentalInquiry): Promise<void> {
  const docRef = doc(db, INQUIRIES_COLLECTION, inquiry.id);
  try {
    await setDoc(docRef, inquiry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${INQUIRIES_COLLECTION}/${inquiry.id}`);
  }
}

/**
 * Update inquiry status in Firestore
 */
export async function updateInquiryStatusInFirestore(
  inquiryId: string,
  status: RentalInquiry['status']
): Promise<void> {
  const docRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${INQUIRIES_COLLECTION}/${inquiryId}`);
  }
}

/**
 * Fetch a user profile by UID
 */
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
}

/**
 * Save or update a user profile
 */
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, profile.uid);
  try {
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${profile.uid}`);
  }
}

/**
 * Subscribe to realtime updates for a user's profile
 */
export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const docRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn(`UserProfile subscription note for ${uid}:`, error.message);
    }
  );
}

