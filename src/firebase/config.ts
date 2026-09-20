import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC_CuuKmjsNyDoxu8kooMmp_8fYP5UEcPk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lifeflow-f4da3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lifeflow-f4da3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lifeflow-f4da3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '935927739627',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:935927739627:web:5977fdb335bc1235a77aae',
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('[LifeFlow Firebase Init] Firebase configuration detected but failed to initialize. Falling back to Local/Demo mode:', error);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };
