"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "./auth-client";

export type Role = "management" | "sales";

export interface UserProfile {
  email: string;
  role: Role;
  name: string;
  initials: string;
}

interface RoleContextValue {
  user: UserProfile | null;
  /** True once we know whether someone is signed in (and have their profile if so). */
  hydrated: boolean;
  /** Signed in with Better Auth, even if no app profile exists yet. */
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  isManagement: boolean;
  isSales: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  hydrated: false,
  isAuthenticated: false,
  logout: async () => {},
  isManagement: false,
  isSales: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");

  const user = isAuthenticated ? (me ?? null) : null;
  const hydrated = !isLoading && (!isAuthenticated || me !== undefined);

  async function logout() {
    await authClient.signOut();
  }

  return (
    <RoleContext.Provider
      value={{
        user,
        hydrated,
        isAuthenticated,
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
