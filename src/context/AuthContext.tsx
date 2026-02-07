"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user: user as AppUser,
        loading: false,
        accountType: user ? "free" : null,
        role: user?.email === 'opulflow.inc@gmail.com' ? "admin" : user ? "owner" : null
      });
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}