import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getAuthClient, isFirebaseConfigured } from "../firebase";

interface AuthState {
  uid: string | null;
  isReady: boolean;
  isConfigured: boolean;
}

/** Signs the browser in anonymously so Firestore/Storage rules can key
 * writes off request.auth.uid — mirrors ios/Hotspots/Services/AuthService. */
export function useAuth(): AuthState {
  const [uid, setUid] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setIsReady(true);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
    });
    return unsubscribe;
  }, [configured]);

  return { uid, isReady, isConfigured: configured };
}
