import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import theme from "@/shared/styles/theme";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "./toastify.css";
import { ThemeProvider } from "@mui/material/styles";
import LoadingBarWrapper from "@/shared/wrapper/LoadingBarWrapper";
import { ToastContainer } from "react-toastify";
import ClientLayout from "@/shared/components/layouts/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insight Paper",
  description: "Una herramienta para la gestión de cursos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <LoadingBarWrapper>{children}</LoadingBarWrapper>
            </ThemeProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              draggable
              theme="dark"
            />
          </AppRouterCacheProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
