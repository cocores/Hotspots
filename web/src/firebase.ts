import { type FirebaseApp, initializeApp } from "firebase/app";
import { connectAuthEmulator, type Auth, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, type Firestore, initializeFirestore } from "firebase/firestore";
import { connectStorageEmulator, type FirebaseStorage, getStorage } from "firebase/storage";

const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST as string | undefined;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? (emulatorHost ? "demo-key" : undefined),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? (emulatorHost ? "demo-hotspots" : undefined),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? (emulatorHost ? "demo-hotspots.appspot.com" : undefined),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? (emulatorHost ? "demo-app-id" : undefined),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function ensureApp(): FirebaseApp {
  if (!app) app = initializeApp(config);
  return app;
}

export function getAuthClient(): Auth {
  if (!auth) {
    auth = getAuth(ensureApp());
    if (emulatorHost) connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = initializeFirestore(ensureApp(), { ignoreUndefinedProperties: true });
    if (emulatorHost) {
      const [host, port] = emulatorHost.split(":");
      connectFirestoreEmulator(db, host, Number(port));
    }
  }
  return db;
}

export function getStorageClient(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(ensureApp());
    if (emulatorHost) connectStorageEmulator(storage, "localhost", 9199);
  }
  return storage;
}
