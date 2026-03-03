interface StageCompleteScreenProps {
  stageId: number;
  score: number;
  onNext: () => void;
  onMenu: () => void;
  isWorldComplete?: boolean;
  world?: number;
}

const worldNames = ['', 'FLATLAND', 'THE UNFOLD'];

export function StageCompleteScreen({ stageId, score, onNext, onMenu, isWorldComplete, world }: StageCompleteScreenProps) {
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
    }}>
      {isWorldComplete ? (
        <>
          <div style={{
            fontSize: '10px',
            letterSpacing: '4px',
            color: '#8b5cf6',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            World Complete
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#e8e8f0',
            marginBottom: '8px',
          }}>
            {worldNames[world ?? 0] || `World ${world}`}
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: '10px',
            letterSpacing: '4px',
            color: '#00ffd5',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Stage Complete
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#e8e8f0',
            marginBottom: '8px',
          }}>
            Stage {stageId}
          </div>
        </>
      )}
      <div style={{
        fontSize: '14px',
        color: '#7a7a8e',
        marginBottom: '32px',
      }}>
        Score: <span style={{ color: '#00ffd5' }}>{score}</span>
      </div>
      <button
        onClick={onNext}
        style={{
          background: 'linear-gradient(135deg, #00ffd520, #8b5cf615)',
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
        {isWorldComplete ? 'Next World' : 'Next Stage'}
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
