import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-appalachian",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const app = getApps().length ? getApp() : initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Local testing against `firebase emulators:start`.
if (process.env.NEXT_PUBLIC_USE_EMULATORS === "1" && typeof window !== "undefined") {
  const w = window as unknown as { __emu?: boolean };
  if (!w.__emu) {
    w.__emu = true;
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
}
