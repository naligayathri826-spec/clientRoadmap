import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AppProvider } from '@/lib/context/AppContext';

export const metadata: Metadata = {
  title: 'AgencyOS — Enterprise OS for AI Automation Agencies',
  description: 'A premium, Apple-inspired B2B SaaS operating system to manage clients, sales pipelines, meetings, projects, finance, and automation agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <body className="h-full flex flex-col selection:bg-blue-500/30">
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
