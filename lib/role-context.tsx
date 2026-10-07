"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { Permission } from "@/convex/permissions";
import { authClient } from "./auth-client";

export type Viewer = NonNullable<FunctionReturnType<typeof api.users.me>>;

interface RoleContextValue {
  user: Viewer | null;
  /** True once we know whether someone is signed in (and have their record if so). */
  hydrated: boolean;
  /** Signed in with Better Auth, even if no active employee record is linked. */
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  hydrated: false,
  isAuthenticated: false,
  can: () => false,
  logout: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");

  const user = isAuthenticated ? (me ?? null) : null;
  const hydrated = !isLoading && (!isAuthenticated || me !== undefined);
  const can = useCallback((p: Permission) => !!user?.permissions.includes(p), [user]);

  async function logout() {
    await authClient.signOut();
  }

  return (
    <RoleContext.Provider value={{ user, hydrated, isAuthenticated, can, logout }}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
