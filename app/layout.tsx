import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskedProfit',
  description: 'Find active local businesses without listed websites',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
