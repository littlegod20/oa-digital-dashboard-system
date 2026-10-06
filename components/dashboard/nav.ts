import type { Icon } from "@phosphor-icons/react";
import {
  AddressBookIcon,
  GearSixIcon,
  KanbanIcon,
  SquaresFourIcon,
  UsersThreeIcon,
  WalletIcon,
} from "@phosphor-icons/react";

export type NavItem = { href: string; label: string; icon: Icon; description: string };

export const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main menu",
    items: [
      { href: "/dashboard",          label: "Overview", icon: SquaresFourIcon, description: "Business at a glance" },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: KanbanIcon,      description: "Deals by phase" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/finance",  label: "Finance",  icon: WalletIcon,      description: "Balances & transactions" },
      { href: "/dashboard/team",     label: "Team",     icon: UsersThreeIcon,  description: "People & performance" },
      { href: "/dashboard/contacts", label: "Contacts", icon: AddressBookIcon, description: "Clients & prospects" },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/dashboard/settings",
  label: "Settings",
  icon: GearSixIcon,
  description: "Profile & preferences",
};

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_SECTIONS.flatMap((s) => s.items), SETTINGS_ITEM];

export function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
