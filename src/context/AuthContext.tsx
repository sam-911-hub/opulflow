"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AppUser extends User {
  accountType?: "free" | "pro";
  role?: "owner" | "admin" | "member";
}

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  accountType: "free" | "pro" | null;
  role: "owner" | "admin" | "member" | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accountType: null,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as AppUser | null,
    loading: true,
    accountType: null as "free" | "pro" | null,
    role: null as "owner" | "admin" | "member" | null
  });



  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (state.loading) {
        console.warn('Auth loading timeout, forcing loaded state');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Immediately set user to prevent loading loop
        setState(prev => ({ ...prev, user, loading: false }));
        
        // Then fetch additional data
        getDoc(doc(db, "users", user.uid)).then((doc) => {
          if (doc.exists()) {
            setState({
              user: { ...user, ...doc.data() },
              loading: false,
              accountType: doc.data().accountType || "free",
              role: doc.data().role || "owner"
            });
          } else {
            // User doc doesn't exist, create default
            setState({
              user,
              loading: false,
              accountType: "free",
              role: "owner"
            });
          }
        }).catch((error) => {
          console.error('Error fetching user doc:', error);
          setState({
            user,
            loading: false,
            accountType: "free",
            role: "owner"
          });
        });
      } else {
        setState({
          user: null,
          loading: false,
          accountType: null,
          role: null
        });
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}