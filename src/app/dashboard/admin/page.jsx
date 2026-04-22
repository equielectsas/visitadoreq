"use client";

import LayoutDashboard from "@/components/LayoutDashboard";
import DashboardBase from "@/components/DashboardBase";

export default function Page() {
  return (
    <LayoutDashboard>
      <DashboardBase rol="adminComercial" />
    </LayoutDashboard>
  );
}