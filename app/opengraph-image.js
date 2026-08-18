import { ImageResponse } from 'next/og';
import { designSystemRuntimeContract } from '@/lib/design-system/runtime-contract';

export const runtime = 'edge';
export const alt = 'CARLOPHILLIPS - Gesture of Luxury';
export const size = designSystemRuntimeContract.openGraph.size;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={designSystemRuntimeContract.openGraph.canvas}
      >
        <div style={designSystemRuntimeContract.openGraph.wordmark}>CARLOPHILLIPS</div>
        <div
          style={designSystemRuntimeContract.openGraph.title}
        >
          Gesture
          of Luxury
        </div>
        <div style={designSystemRuntimeContract.openGraph.status}>
          First release in preparation
        </div>
      </div>
    ),
    size
  );
}
