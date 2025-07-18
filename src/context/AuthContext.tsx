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
    }, 10000); // Increased timeout to 10 seconds

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Ensure credits object has all required fields
            const credits = userData.credits || {};
            const defaultCredits = {
              ai_email: 0,
              lead_lookup: 0,
              company_enrichment: 0,
              email_verification: 0,
              workflow: 0,
              crm_sync: 0
            };
            
            // Merge default credits with user credits
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
          } else {
            // User doc doesn't exist
            console.warn(`User document not found for uid: ${user.uid}`);
            setState({
              user: {
                ...user,
                credits: {
                  ai_email: 0,
                  lead_lookup: 0,
                  company_enrichment: 0,
                  email_verification: 0,
                  workflow: 0,
                  crm_sync: 0
                }
              } as AppUser,
              loading: false,
              accountType: "free",
              role: "owner"
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setState({
            user: {
              ...user,
              credits: {
                ai_email: 0,
                lead_lookup: 0,
                company_enrichment: 0,
                email_verification: 0,
                workflow: 0,
                crm_sync: 0
              }
            } as AppUser,
            loading: false,
            accountType: "free",
            role: "owner"
          });
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
      // Handle auth state change errors
      console.error('Auth state change error:', error);
      setState({
        user: null,
        loading: false,
        accountType: null,
        role: null
      });
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