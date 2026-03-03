interface PauseScreenProps {
  onResume: () => void;
  onMenu: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export function PauseScreen({ onResume, onMenu, onToggleMute, isMuted }: PauseScreenProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(10, 10, 15, 0.85)',
      zIndex: 30,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '4px',
        color: '#7a7a8e',
        textTransform: 'uppercase',
        marginBottom: '24px',
      }}>
        Paused
      </div>
      <button
        onClick={onResume}
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
        Resume
      </button>
      <button
        onClick={onToggleMute}
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
          marginBottom: '12px',
          minWidth: '200px',
        }}
      >
        Sound: {isMuted ? 'OFF' : 'ON'}
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
        Quit to Menu
      </button>
    </div>
  );
}
