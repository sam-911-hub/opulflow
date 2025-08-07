"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CreditType } from "@/types/interfaces";

interface AppUser extends User {
  accountType?: "free" | "pro";
  role?: "owner" | "admin" | "member";
  credits?: Record<CreditType, number>;
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
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(loadingTimeout); // Clear timeout when auth state changes
      
      if (user) {
        // Create basic user object first to avoid loading timeout
        const defaultCredits = {
          ai_email: 0,
          lead_lookup: 0,
          company_enrichment: 0,
          email_verification: 0,
          workflow: 0,
          crm_sync: 0
        };
        
        const basicUser = {
          user: {
            ...user,
            credits: defaultCredits
          } as AppUser,
          loading: false,
          accountType: "free" as const,
          role: (user.email === 'opulflow.inc@gmail.com' ? "admin" : "owner") as const
        };
        
        // Set basic user immediately
        setState(basicUser);
        
        // Try to fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.email || user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const credits = userData.credits || {};
            const mergedCredits = { ...defaultCredits, ...credits };
            
            setState({
              user: { 
                ...user, 
                ...userData,
                credits: mergedCredits 
              } as AppUser,
              loading: false,
              accountType: userData.accountType || "free",
              role: userData.role || "owner"
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Keep the basic user object if Firestore fetch fails
        }
      } else {
        setState({
          user: null,
          loading: false,
          accountType: null,
          role: null
        });
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      clearTimeout(loadingTimeout);
      setState({
        user: null,
        loading: false,
        accountType: null,
        role: null
      });
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}