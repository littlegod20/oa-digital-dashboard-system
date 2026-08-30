"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "management" | "sales";

export interface UserProfile {
  email: string;
  role: Role;
  name: string;
  initials: string;
}

export const USERS: UserProfile[] = [
  {
    email: "info@oadigismartsecurity.com",
    role: "management",
    name: "Management",
    initials: "MG",
  },
  {
    email: "sales@oadigismartsecurity.com",
    role: "sales",
    name: "Sales Team",
    initials: "ST",
  },
];

interface RoleContextValue {
  user: UserProfile | null;
  hydrated: boolean;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  isManagement: boolean;
  isSales: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  hydrated: false,
  setUser: () => {},
  logout: () => {},
  isManagement: false,
  isSales: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("oa-user");
      if (stored) setUserState(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  function setUser(u: UserProfile) {
    setUserState(u);
    try { localStorage.setItem("oa-user", JSON.stringify(u)); } catch {}
  }

  function logout() {
    setUserState(null);
    try { localStorage.removeItem("oa-user"); } catch {}
  }

  return (
    <RoleContext.Provider
      value={{
        user,
        hydrated,
        setUser,
        logout,
        isManagement: user?.role === "management",
        isSales: user?.role === "sales",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
