'use client';

import CelestialBackground from '@/components/CelestialBackground/CelestialBackground';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <CelestialBackground variant="page" />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
