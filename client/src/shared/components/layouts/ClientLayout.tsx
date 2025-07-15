// shared/layout/ClientLayout.tsx
"use client";

import { ReactNode, Suspense } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>;
}
