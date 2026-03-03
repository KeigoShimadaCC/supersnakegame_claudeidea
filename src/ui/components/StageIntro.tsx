import { useEffect, useState } from 'react';

interface StageIntroProps {
  stageId: number;
  stageName: string;
  description: string;
  world: number;
}

const worldNames = ['', 'FLATLAND', 'THE UNFOLD'];

export function StageIntro({ stageId, stageName, description, world }: StageIntroProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setOpacity(1));
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(10, 10, 15, 0.85)',
      zIndex: 20,
      fontFamily: "'Courier New', monospace",
      opacity,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '4px',
        color: '#7a7a8e',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        World {world} · {worldNames[world] || ''}
      </div>
      <div style={{
        fontSize: 'clamp(24px, 5vw, 36px)',
        fontWeight: 700,
        color: '#e8e8f0',
        letterSpacing: '-1px',
        marginBottom: '4px',
      }}>
        Stage {stageId}
      </div>
      <div style={{
        fontSize: '16px',
        color: '#00ffd5',
        fontWeight: 700,
        marginBottom: '12px',
      }}>
        {stageName}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#7a7a8e',
        maxWidth: '300px',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        {description}
      </div>
    </div>
  );
}
