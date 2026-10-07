import { RequirePermission } from "@/components/ui/require-permission";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequirePermission permission="finance.view">{children}</RequirePermission>;
}
