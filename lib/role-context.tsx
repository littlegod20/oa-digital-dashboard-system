"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role, UserProfile } from "./auth";

// Re-export for consumers that already import from here
export type { Role, UserProfile };

interface RoleContextValue {
  user: UserProfile | null;
  hydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  isManagement: boolean;
  isSales: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  hydrated: false,
  setUser: () => {},
  logout: async () => {},
  isManagement: false,
  isSales: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        // Don't clobber a user already set by the login form
        setUser((prev) => prev ?? u);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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
