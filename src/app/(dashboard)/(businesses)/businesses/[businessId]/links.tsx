"use client";

import {
  Box,
  Home,
  Shapes,
  ShoppingBasket,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export const links = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    name: "Products",
    icon: Box,
    href: "/products",
  },
  {
    name: "Categories",
    icon: Shapes,
    href: "/categories",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
  {
    name: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    name: "Purchases",
    icon: ShoppingBasket,
    href: "/purchases",
  },
  {
    name: "Suppliers",
    icon: Truck,
    href: "/suppliers",
  },
];
