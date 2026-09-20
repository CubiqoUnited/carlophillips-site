import HeroMorphPreview from '@/components/editorial/HeroMorphPreview';

export const metadata = {
  title: 'At the Edge Of Life — Rugged Runway Preview',
  description: 'Carlo Phillips rugged Norwegian runway hero motion preview.',
  // KAN-24: internal preview surface. noindex is a stopgap, not a gate.
  robots: { index: false, follow: false },
};

export default function RuggedHeroPreviewPage() {
  return <HeroMorphPreview variant="rugged" />;
}
