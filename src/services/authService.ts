import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { UserProfile } from '../types';
import { DEMO_USER_PROFILE } from '../data/demo/seedData';

const LOCAL_USER_KEY = 'lifeflow_user_profile';
const LOCAL_AUTH_STATE_KEY = 'lifeflow_auth_state';

// In local/demo mode, retrieve or persist the user
function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse local profile:', err);
  }
  return DEMO_USER_PROFILE;
}

function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save local profile:', err);
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      // Create user document if missing
      const newProfile: UserProfile = {
        id: uid,
        name: userCredential.user.displayName || email.split('@')[0],
        email: email,
        dateOfBirth: '1995-09-20',
        language: 'en',
        theme: 'system',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        timeFormat: '24h',
        temperatureUnit: 'celsius',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  }

  // Local / Demo Mode authentication
  const current = getLocalProfile();
  const profile: UserProfile = {
    ...current,
    email: email || current.email,
    name: email ? email.split('@')[0] : current.name,
    updatedAt: new Date().toISOString(),
  };
  saveLocalProfile(profile);
  localStorage.setItem(LOCAL_AUTH_STATE_KEY, 'true');
  return profile;
}

export async function registerWithEmail(
  name: string,
  email: string,
  pass: string,
  dob?: string
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;
    const newProfile: UserProfile = {
      id: uid,
      name: name || email.split('@')[0],
      email: email,
      dateOfBirth: dob || '1995-09-20',
      language: 'en',
      theme: 'system',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      timeFormat: '24h',
      temperatureUnit: 'celsius',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid), newProfile);
    return newProfile;
  }

  // Local / Demo Mode Registration
  const profile: UserProfile = {
    ...DEMO_USER_PROFILE,
    id: `local-user-${Date.now()}`,
    name: name || 'User',
    email: email,
    dateOfBirth: dob || '1995-09-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveLocalProfile(profile);
  localStorage.setItem(LOCAL_AUTH_STATE_KEY, 'true');
  return profile;
}

export async function resetUserPassword(email: string): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
    return;
  }
  // Simulated success in demo mode
  return Promise.resolve();
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem(LOCAL_AUTH_STATE_KEY);
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  if (isFirebaseConfigured && db) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  const current = getLocalProfile();
  const updated: UserProfile = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveLocalProfile(updated);
  return updated;
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  const firestore = db;
  const firebaseAuth = auth;

  if (isFirebaseConfigured && firebaseAuth && firestore) {
    return fbOnAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const snap = await getDoc(doc(firestore, 'users', fbUser.uid));
          if (snap.exists()) {
            callback(snap.data() as UserProfile);
            return;
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
        callback({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          dateOfBirth: '1995-09-20',
          language: 'en',
          theme: 'system',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          timeFormat: '24h',
          temperatureUnit: 'celsius',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        callback(null);
      }
    });
  }

  // Local / Demo Mode subscriber
  const isAuthenticated = localStorage.getItem(LOCAL_AUTH_STATE_KEY) === 'true';
  if (isAuthenticated) {
    callback(getLocalProfile());
  } else {
    // Default demo authenticated state for instant productive playground
    callback(getLocalProfile());
    localStorage.setItem(LOCAL_AUTH_STATE_KEY, 'true');
  }

  return () => {};
}
