"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react";
import type { Permission } from "@/convex/permissions";
import { useRole } from "@/lib/role-context";
import { EmptyState } from "@/components/ui/states";

/** Renders children only for viewers holding `permission`; others get a friendly dead end. */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useRole();
  if (can(permission)) return <>{children}</>;
  return (
    <div className="card mt-6">
      <EmptyState
        icon={LockKeyIcon}
        title="You don't have access to this page"
        description="If you need it for your work, ask Gerhard or HR to update your access."
        action={
          <Link href="/dashboard" className="btn btn-secondary">
            Back to overview
          </Link>
        }
      />
    </div>
  );
}
