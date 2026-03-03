interface DeathScreenProps {
  score: number;
  highScore: number;
  onRetry: () => void;
  onMenu: () => void;
}

export function DeathScreen({ score, highScore, onRetry, onMenu }: DeathScreenProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(10, 10, 15, 0.9)',
      zIndex: 30,
      fontFamily: "'Courier New', monospace",
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '4px',
        color: '#ff3366',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        Game Over
      </div>
      <div style={{
        fontSize: '48px',
        fontWeight: 700,
        color: '#e8e8f0',
        marginBottom: '8px',
      }}>
        {score}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#7a7a8e',
        marginBottom: '32px',
      }}>
        Best: {highScore}
      </div>
      <button
        onClick={onRetry}
        style={{
          background: 'linear-gradient(135deg, #00ffd520, #00ffd510)',
          border: '1px solid #00ffd540',
          color: '#00ffd5',
          padding: '12px 32px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          marginBottom: '12px',
          minWidth: '200px',
        }}
      >
        Retry
      </button>
      <button
        onClick={onMenu}
        style={{
          background: 'transparent',
          border: '1px solid #1e1e2e',
          color: '#7a7a8e',
          padding: '10px 32px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          minWidth: '200px',
        }}
      >
        Menu
      </button>
    </div>
  );
}
