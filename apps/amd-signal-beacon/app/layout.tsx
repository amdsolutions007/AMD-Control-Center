import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AMD Signal Beacon Pro',
  description: 'RSS Content Engine for African Tech Ecosystem Domination on Leke Leke',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
