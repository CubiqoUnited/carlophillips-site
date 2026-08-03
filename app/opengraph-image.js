import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CARLOPHILLIPS - Gesture of Luxury';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#020202',
          color: '#ffffff',
          padding: 72,
          fontFamily: 'Arial',
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8 }}>CARLOPHILLIPS</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 132,
            lineHeight: 0.9,
            letterSpacing: -8,
          }}
        >
          Gesture
          of Luxury
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.62)' }}>
          First release in preparation
        </div>
      </div>
    ),
    size
  );
}
