import type { ComponentType, SVGProps } from "react";
import {
  DashboardIcon,
  OrdersIcon,
  ProductsIcon,
  CategoriesIcon,
  ContentIcon,
} from "./AdminIcons";

type IconComponent = ComponentType<
  Omit<SVGProps<SVGSVGElement>, "stroke"> & { size?: number }
>;

export type AdminNavItem = {
  href: string;
  label: string;
  Icon: IconComponent;
};

export const adminNav: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon },
  { href: "/admin/orders", label: "Orders", Icon: OrdersIcon },
  { href: "/admin/products", label: "Products", Icon: ProductsIcon },
  { href: "/admin/categories", label: "Categories", Icon: CategoriesIcon },
  { href: "/admin/content", label: "Content", Icon: ContentIcon },
];
