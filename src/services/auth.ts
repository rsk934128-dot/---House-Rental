import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { SavedGoogleAccount } from '../types';

export { auth };

export const SCOPES = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.other.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/directory.readonly',
  'https://www.googleapis.com/auth/user.addresses.read',
  'https://www.googleapis.com/auth/user.birthday.read',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.gender.read',
  'https://www.googleapis.com/auth/user.organization.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
// Enable Google multi-account selection dialog by default
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const SAVED_ACCOUNTS_KEY = 'bd_house_rental_google_accounts_v1';

/**
 * Retrieve list of previously logged in Google accounts from local storage
 */
export const getSavedGoogleAccounts = (): SavedGoogleAccount[] => {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved accounts:', e);
    return [];
  }
};

/**
 * Save or update an account in the local multi-account list
 */
export const saveGoogleAccountToHistory = (
  user: User,
  extra?: { role?: 'landlord' | 'tenant' | 'both'; phone?: string; displayName?: string }
): SavedGoogleAccount[] => {
  try {
    const existing = getSavedGoogleAccounts();
    const updated: SavedGoogleAccount = {
      uid: user.uid,
      email: user.email || '',
      displayName: extra?.displayName || user.displayName || user.email?.split('@')[0] || 'ব্যবহারকারী',
      photoURL: user.photoURL || undefined,
      role: extra?.role || 'both',
      phone: extra?.phone,
      lastLoginAt: new Date().toISOString()
    };

    // Filter out previous entry if present and put newest at top
    const filtered = existing.filter(acc => acc.uid !== user.uid && acc.email !== user.email);
    const result = [updated, ...filtered];
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn('Failed to save account to history:', e);
    return [];
  }
};

/**
 * Remove an account from saved accounts list
 */
export const removeSavedGoogleAccount = (uid: string): SavedGoogleAccount[] => {
  try {
    const existing = getSavedGoogleAccounts();
    const result = existing.filter(acc => acc.uid !== uid);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn('Failed to remove account:', e);
    return [];
  }
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Automatically keep saved accounts updated
      saveGoogleAccountToHistory(user);
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google with multi-account picker prompted
 */
export const googleSignIn = async (
  forceAccountSelect: boolean = true
): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    if (forceAccountSelect) {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    if (result.user) {
      saveGoogleAccountToHistory(result.user);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Normal user cancellation or closing popup should not trigger errors or crash
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    if (
      errorCode === 'auth/popup-closed-by-user' ||
      errorCode === 'auth/cancelled-popup-request' ||
      errorCode === 'auth/user-cancelled' ||
      errorMessage.includes('popup-closed-by-user')
    ) {
      // User simply closed the popup or clicked away, safe return null
      return null;
    }

    if (errorCode === 'auth/popup-blocked') {
      console.warn('Google sign-in popup was blocked by browser. Please allow popups or open in a new tab.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-mobile-notice', {
          detail: {
            type: 'popup-blocked',
            message: 'মোবাইল ব্রাউজারে গুগল লগইন পপআপ ব্লক রয়েছে। ব্রাউজার সেটিংসে Pop-ups এলাও (Allow) করুন।'
          }
        }));
      }
      return null;
    }

    // For any unexpected network or auth issues, log as warning
    console.warn('Google sign in warning:', errorCode, errorMessage);
    if (typeof window !== 'undefined' && errorMessage) {
      window.dispatchEvent(new CustomEvent('auth-mobile-notice', {
        detail: {
          type: 'auth-error',
          message: errorCode === 'auth/network-request-failed' 
            ? 'ইন্টারনেট সংযোগ চেক করুন এবং পুনরায় চেষ্টা করুন।' 
            : 'লগইন করতে সমস্যা হচ্ছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
        }
      }));
    }
    return null;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Switch to another Google Account (Multi-account switch)
 */
export const switchGoogleAccount = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  // Always force select_account dialog
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return await googleSignIn(true);
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
