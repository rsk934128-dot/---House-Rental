import { GoogleContactItem } from '../types';

const CONTACTS_CACHE_KEY = 'bd_house_rental_google_contacts_cache_v1';

/**
 * Get locally cached contacts for quick display
 */
export const getCachedContacts = (): GoogleContactItem[] => {
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to get cached contacts:', e);
    return [];
  }
};

/**
 * Cache contacts locally
 */
export const setCachedContacts = (contacts: GoogleContactItem[]): void => {
  try {
    localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.warn('Failed to save contacts cache:', e);
  }
};

/**
 * Fetch contacts from Google People API
 */
export const fetchGoogleContacts = async (accessToken: string): Promise<GoogleContactItem[]> => {
  if (!accessToken) {
    throw new Error('Google Access Token পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।');
  }

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,biographies,organizations&pageSize=100&sortOrder=LAST_MODIFIED_DESCENDING';

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${res.status}`;
    throw new Error(`গুগল কন্টাক্টস লোড করা সম্ভব হয়নি: ${message}`);
  }

  const data = await res.json();
  const connections = data.connections || [];

  const parsed: GoogleContactItem[] = connections.map((c: any) => {
    const primaryName = c.names?.[0];
    const primaryEmail = c.emailAddresses?.[0]?.value || '';
    const primaryPhone = c.phoneNumbers?.[0]?.value || '';
    const photo = c.photos?.[0]?.url || '';
    const bio = c.biographies?.[0]?.value || '';
    const org = c.organizations?.[0]?.name || '';
    const title = c.organizations?.[0]?.title || '';

    return {
      resourceName: c.resourceName,
      etag: c.etag,
      name: primaryName?.displayName || primaryName?.givenName || primaryEmail || 'নামহীন কন্টাক্ট',
      givenName: primaryName?.givenName || '',
      familyName: primaryName?.familyName || '',
      email: primaryEmail,
      phone: primaryPhone,
      photoUrl: photo,
      notes: bio,
      organization: org,
      jobTitle: title
    };
  });

  setCachedContacts(parsed);
  return parsed;
};

/**
 * Create a new Contact in Google Contacts
 * MANDATORY User Confirmation must be performed in UI before calling this!
 */
export const createGoogleContact = async (
  accessToken: string,
  contact: {
    givenName: string;
    familyName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    organization?: string;
    jobTitle?: string;
  }
): Promise<GoogleContactItem> => {
  if (!accessToken) {
    throw new Error('Google Access Token পাওয়া যায়নি।');
  }

  const payload: any = {
    names: [
      {
        givenName: contact.givenName,
        familyName: contact.familyName || ''
      }
    ]
  };

  if (contact.email?.trim()) {
    payload.emailAddresses = [{ value: contact.email.trim(), type: 'home' }];
  }

  if (contact.phone?.trim()) {
    payload.phoneNumbers = [{ value: contact.phone.trim(), type: 'mobile' }];
  }

  if (contact.notes?.trim()) {
    payload.biographies = [{ value: contact.notes.trim(), contentType: 'TEXT_PLAIN' }];
  }

  if (contact.organization?.trim() || contact.jobTitle?.trim()) {
    payload.organizations = [
      {
        name: contact.organization?.trim() || 'বাসা বাড়ি ভাড়া',
        title: contact.jobTitle?.trim() || ''
      }
    ];
  }

  const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${res.status}`;
    throw new Error(`কন্টাক্ট সেভ করতে সমস্যা হয়েছে: ${message}`);
  }

  const data = await res.json();
  const createdName = data.names?.[0];
  const newContact: GoogleContactItem = {
    resourceName: data.resourceName,
    etag: data.etag,
    name: createdName?.displayName || createdName?.givenName || contact.givenName,
    givenName: createdName?.givenName || contact.givenName,
    familyName: createdName?.familyName || contact.familyName || '',
    email: data.emailAddresses?.[0]?.value || contact.email || '',
    phone: data.phoneNumbers?.[0]?.value || contact.phone || '',
    photoUrl: data.photos?.[0]?.url || '',
    notes: contact.notes || '',
    organization: contact.organization || '',
    jobTitle: contact.jobTitle || ''
  };

  // Update cached list
  const current = getCachedContacts();
  setCachedContacts([newContact, ...current]);

  return newContact;
};

/**
 * Delete a Contact from Google Contacts
 * MANDATORY: Requires explicit user confirmation dialog in UI!
 */
export const deleteGoogleContact = async (
  accessToken: string,
  resourceName: string
): Promise<boolean> => {
  if (!accessToken) {
    throw new Error('Google Access Token পাওয়া যায়নি।');
  }

  const res = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 404) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${res.status}`;
    throw new Error(`কন্টাক্ট ডিলিট করতে সমস্যা হয়েছে: ${message}`);
  }

  // Remove from cache
  const current = getCachedContacts();
  setCachedContacts(current.filter(c => c.resourceName !== resourceName));

  return true;
};
