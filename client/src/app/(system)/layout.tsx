import SystemLayout from "@/shared/components/layouts/SystemLayout";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return <SystemLayout>{children}</SystemLayout>;
}
