import DocumentsProvider from "@/modules/documents/context/DocumentsProvider";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DocumentsProvider>{children}</DocumentsProvider>
    );
}