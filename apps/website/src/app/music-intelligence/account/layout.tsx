import type { Metadata } from 'next';
import ArtistWorkspaceShell from '@/components/music-intelligence/workspace/ArtistWorkspaceShell';

export const metadata: Metadata = {
  title: 'Artist Command Center — AMD Music Intelligence',
  description: 'Artist workspace for profile management and music submissions.',
};

export default function ArtistAccountLayout({ children }: { children: React.ReactNode }) {
  return <ArtistWorkspaceShell>{children}</ArtistWorkspaceShell>;
}
