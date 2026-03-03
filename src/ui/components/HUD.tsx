import type { GameStatus } from '../../game/core/GameEngine';

const styles = {
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'none' as const,
    fontFamily: "'Courier New', monospace",
    zIndex: 10,
  },
  left: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  right: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
    gap: '4px',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#7a7a8e',
    textTransform: 'uppercase' as const,
  },
  value: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#e8e8f0',
  },
  accent: {
    color: '#00ffd5',
  },
  bossBar: {
    position: 'absolute' as const,
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    maxWidth: '60%',
  },
  bossBarBg: {
    height: '6px',
    background: '#1e1e2e',
    borderRadius: '3px',
    overflow: 'hidden' as const,
  },
  bossBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff3366, #ff6633)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  bossLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#ff3366',
    textAlign: 'center' as const,
    marginBottom: '4px',
  },
  progressBar: {
    marginTop: '4px',
    width: '80px',
    height: '4px',
    background: '#1e1e2e',
    borderRadius: '2px',
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    background: '#00ffd5',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
};

interface HUDProps {
  status: GameStatus;
  stageName: string;
}

export function HUD({ status, stageName }: HUDProps) {
  const scoreProgress = status.targetScore > 0
    ? Math.min((status.score / status.targetScore) * 100, 100)
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.label}>Score</div>
        <div style={styles.value}>
          <span style={styles.accent}>{status.score}</span>
          <span style={{ fontSize: '12px', color: '#7a7a8e' }}> / {status.targetScore}</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${scoreProgress}%` }} />
        </div>
      </div>

      <div style={{ textAlign: 'center' as const }}>
        <div style={styles.label}>Stage {status.stageId}</div>
        <div style={{ fontSize: '12px', color: '#e8e8f0', marginTop: '2px' }}>{stageName}</div>
      </div>

      <div style={styles.right}>
        <div style={styles.label}>Length</div>
        <div style={styles.value}>{status.snakeLength}</div>
        {status.highScore > 0 && (
          <div style={{ fontSize: '10px', color: '#7a7a8e' }}>Best: {status.highScore}</div>
        )}
      </div>

      {status.bossHealth !== undefined && status.bossMaxHealth !== undefined && status.bossMaxHealth > 0 && (
        <div style={styles.bossBar}>
          <div style={styles.bossLabel}>BOSS</div>
          <div style={styles.bossBarBg}>
            <div style={{
              ...styles.bossBarFill,
              width: `${(status.bossHealth / status.bossMaxHealth) * 100}%`
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
